-- Atlas — 0002 · Tenancy and RBAC
--
-- tenants, profiles (mirror of auth.users), configurable roles + permissions,
-- and tenant membership. This migration establishes the identity spine every
-- other table hangs off.

-- ---------------------------------------------------------------------------
-- tenants
-- ---------------------------------------------------------------------------
create table tenants (
  id          uuid primary key default gen_random_uuid(),
  slug        citext not null unique,
  name        text not null,
  status      text not null default 'active'
              check (status in ('active', 'suspended', 'archived')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger tenants_updated_at before update on tenants
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- profiles — one row per auth user, created by trigger on auth.users
-- ---------------------------------------------------------------------------
create table profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  email              citext not null,
  full_name          text,
  avatar_url         text,
  is_platform_admin  boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- roles + permissions (configurable RBAC)
--
-- Platform roles have tenant_id = null and are shared. Tenants may define their
-- own roles (tenant_id set). Permissions are a shared catalog of string keys.
-- ---------------------------------------------------------------------------
create table permissions (
  key          text primary key,      -- e.g. 'page.publish', 'booking.manage'
  description  text not null
);

create table roles (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references tenants(id) on delete cascade,  -- null = platform role
  key         text not null,
  name        text not null,
  is_system   boolean not null default false,  -- system roles cannot be deleted
  created_at  timestamptz not null default now(),
  unique (tenant_id, key)
);

create table role_permissions (
  role_id     uuid not null references roles(id) on delete cascade,
  permission  text not null references permissions(key) on delete cascade,
  primary key (role_id, permission)
);

-- ---------------------------------------------------------------------------
-- tenant_members — membership + role assignment
-- ---------------------------------------------------------------------------
create table tenant_members (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  role_id     uuid not null references roles(id),
  created_at  timestamptz not null default now(),
  unique (tenant_id, user_id)
);
create index tenant_members_tenant_idx on tenant_members (tenant_id);
create index tenant_members_user_idx on tenant_members (user_id);

-- ---------------------------------------------------------------------------
-- Seed: the permission catalog and platform/system role templates
-- ---------------------------------------------------------------------------
insert into permissions (key, description) values
  ('tenant.manage',    'Manage tenant settings, domains, and branding'),
  ('member.manage',    'Invite, remove, and assign roles to members'),
  ('page.view',        'View pages and drafts'),
  ('page.edit',        'Create and edit page drafts'),
  ('page.publish',     'Publish and schedule pages'),
  ('asset.manage',     'Upload and manage assets'),
  ('theme.manage',     'Edit tenant themes'),
  ('navigation.manage','Edit navigation menus'),
  ('form.manage',      'Manage forms and view submissions'),
  ('booking.manage',   'Manage services, staff, availability, and bookings'),
  ('module.manage',    'Install and configure modules'),
  ('analytics.view',   'View analytics'),
  ('comms.manage',     'Manage email and SMS templates');

-- Platform + default tenant roles (tenant_id null = template applied per tenant
-- at onboarding by copying into tenant-scoped rows; see packages/authentication).
insert into roles (tenant_id, key, name, is_system) values
  (null, 'platform_admin', 'Platform Admin', true),
  (null, 'agency_admin',   'Agency Admin',   true),
  (null, 'developer',      'Developer',      true),
  (null, 'designer',       'Designer',       true),
  (null, 'client_admin',   'Client Admin',   true),
  (null, 'content_editor', 'Content Editor', true),
  (null, 'marketing',      'Marketing',      true),
  (null, 'support',        'Support',        true);

-- Grant permissions to the template roles.
insert into role_permissions (role_id, permission)
select r.id, p.key from roles r cross join permissions p
  where r.key in ('platform_admin', 'agency_admin');  -- full access

insert into role_permissions (role_id, permission)
select r.id, p.key from roles r
  join permissions p on p.key in
    ('page.view','page.edit','page.publish','asset.manage','theme.manage',
     'navigation.manage','form.manage','booking.manage','module.manage',
     'analytics.view','comms.manage')
  where r.key = 'developer';

insert into role_permissions (role_id, permission)
select r.id, p.key from roles r
  join permissions p on p.key in
    ('page.view','page.edit','theme.manage','asset.manage','navigation.manage')
  where r.key = 'designer';

insert into role_permissions (role_id, permission)
select r.id, p.key from roles r
  join permissions p on p.key in
    ('page.view','page.edit','page.publish','asset.manage','form.manage',
     'booking.manage','analytics.view','member.manage')
  where r.key = 'client_admin';

insert into role_permissions (role_id, permission)
select r.id, p.key from roles r
  join permissions p on p.key in ('page.view','page.edit','asset.manage')
  where r.key = 'content_editor';

insert into role_permissions (role_id, permission)
select r.id, p.key from roles r
  join permissions p on p.key in
    ('page.view','analytics.view','form.manage','comms.manage')
  where r.key = 'marketing';

insert into role_permissions (role_id, permission)
select r.id, p.key from roles r
  join permissions p on p.key in ('page.view','form.manage','booking.manage')
  where r.key = 'support';

-- ---------------------------------------------------------------------------
-- RLS predicate helpers — defined here (not 0001) because `language sql` bodies
-- are validated against the catalog at CREATE time, so the tables they read must
-- already exist. SECURITY DEFINER + pinned search_path so policies can call them
-- without recursing into the caller's own RLS. STABLE for planner efficiency.
-- ---------------------------------------------------------------------------

-- Is the current user a platform admin? Platform admins bypass tenant isolation
-- through explicit, audited policy branches — never by disabling RLS.
create or replace function is_platform_admin()
returns boolean language sql stable security definer set search_path = public
as $$
  select coalesce((select p.is_platform_admin from profiles p where p.id = auth.uid()), false);
$$;

-- Is the current user a member of the given tenant? The core isolation predicate.
create or replace function is_tenant_member(tid uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from tenant_members tm
    where tm.tenant_id = tid and tm.user_id = auth.uid()
  );
$$;

-- Does the current user hold the given permission within the given tenant?
-- Platform admins hold everything.
create or replace function has_tenant_permission(tid uuid, perm text)
returns boolean language sql stable security definer set search_path = public
as $$
  select is_platform_admin() or exists (
    select 1 from tenant_members tm
    join role_permissions rp on rp.role_id = tm.role_id
    where tm.tenant_id = tid and tm.user_id = auth.uid() and rp.permission = perm
  );
$$;

comment on function is_tenant_member(uuid) is
  'Core RLS predicate: true when auth.uid() is a member of tenant tid.';
comment on function has_tenant_permission(uuid, text) is
  'RBAC predicate: true when the current user holds perm within tenant tid (platform admins hold all).';

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table tenants          enable row level security;
alter table profiles         enable row level security;
alter table roles            enable row level security;
alter table role_permissions enable row level security;
alter table tenant_members   enable row level security;
alter table permissions      enable row level security;

-- permissions catalog: readable by any authenticated user, writable by no one
-- (managed via migrations only).
create policy permissions_read on permissions
  for select to authenticated using (true);

-- tenants: members can see their tenants; platform admins see all.
create policy tenants_select on tenants
  for select to authenticated
  using (is_platform_admin() or is_tenant_member(id));
create policy tenants_write on tenants
  for all to authenticated
  using (is_platform_admin() or has_tenant_permission(id, 'tenant.manage'))
  with check (is_platform_admin() or has_tenant_permission(id, 'tenant.manage'));

-- profiles: a user sees their own profile; platform admins see all.
create policy profiles_self on profiles
  for select to authenticated
  using (id = auth.uid() or is_platform_admin());
create policy profiles_update_self on profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and is_platform_admin = (select is_platform_admin from profiles where id = auth.uid()));

-- roles / role_permissions: readable by members of the owning tenant (or all
-- for platform template roles); writable by member.manage holders.
create policy roles_select on roles
  for select to authenticated
  using (tenant_id is null or is_tenant_member(tenant_id) or is_platform_admin());
create policy roles_write on roles
  for all to authenticated
  using (tenant_id is not null and has_tenant_permission(tenant_id, 'member.manage'))
  with check (tenant_id is not null and has_tenant_permission(tenant_id, 'member.manage'));

create policy role_permissions_select on role_permissions
  for select to authenticated using (true);
create policy role_permissions_write on role_permissions
  for all to authenticated
  using (exists (select 1 from roles r where r.id = role_id
                 and r.tenant_id is not null
                 and has_tenant_permission(r.tenant_id, 'member.manage')))
  with check (exists (select 1 from roles r where r.id = role_id
                 and r.tenant_id is not null
                 and has_tenant_permission(r.tenant_id, 'member.manage')));

-- tenant_members: members of a tenant can see its roster; member.manage to change.
create policy tenant_members_select on tenant_members
  for select to authenticated
  using (is_platform_admin() or is_tenant_member(tenant_id));
create policy tenant_members_write on tenant_members
  for all to authenticated
  using (is_platform_admin() or has_tenant_permission(tenant_id, 'member.manage'))
  with check (is_platform_admin() or has_tenant_permission(tenant_id, 'member.manage'));
