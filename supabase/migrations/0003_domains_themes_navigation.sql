-- Atlas — 0003 · Domains, themes, navigation
--
-- Tenant presentation & routing config. The website renderer (anon role) needs
-- public read access to the active theme and navigation to render a public site,
-- so these carry an additional anon-read policy alongside the member policies.

-- ---------------------------------------------------------------------------
-- domains — host → tenant resolution (multi-tenancy §3)
-- ---------------------------------------------------------------------------
create table domains (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references tenants(id) on delete cascade,
  hostname     citext not null unique,
  is_primary   boolean not null default false,
  verified_at  timestamptz,
  created_at   timestamptz not null default now()
);
create index domains_tenant_idx on domains (tenant_id);
-- exactly one primary domain per tenant
create unique index domains_one_primary on domains (tenant_id) where is_primary;

-- ---------------------------------------------------------------------------
-- themes — branding tokens as JSONB (validated by @atlas/shared Zod schema)
-- ---------------------------------------------------------------------------
create table themes (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  name        text not null,
  tokens      jsonb not null default '{}'::jsonb,
  is_active   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index themes_tenant_idx on themes (tenant_id);
create unique index themes_one_active on themes (tenant_id) where is_active;
create trigger themes_updated_at before update on themes
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- navigation — menus and their items (self-referential tree)
-- ---------------------------------------------------------------------------
create table navigations (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  key         text not null,          -- e.g. 'primary', 'footer'
  name        text not null,
  created_at  timestamptz not null default now(),
  unique (tenant_id, key)
);
create index navigations_tenant_idx on navigations (tenant_id);

create table navigation_items (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references tenants(id) on delete cascade,
  navigation_id  uuid not null references navigations(id) on delete cascade,
  parent_id      uuid references navigation_items(id) on delete cascade,
  label          text not null,
  url            text,               -- external or absolute
  page_id        uuid,               -- internal link (FK added in 0004 after pages)
  sort_order     int not null default 0,
  created_at     timestamptz not null default now()
);
create index navigation_items_nav_idx on navigation_items (navigation_id);
create index navigation_items_tenant_idx on navigation_items (tenant_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table domains          enable row level security;
alter table themes           enable row level security;
alter table navigations      enable row level security;
alter table navigation_items enable row level security;

-- domains: members read, tenant.manage writes. No anon read (routing is resolved
-- server-side with the service role).
create policy domains_select on domains for select to authenticated
  using (is_platform_admin() or is_tenant_member(tenant_id));
create policy domains_write on domains for all to authenticated
  using (is_platform_admin() or has_tenant_permission(tenant_id, 'tenant.manage'))
  with check (is_platform_admin() or has_tenant_permission(tenant_id, 'tenant.manage'));

-- themes: members read; theme.manage writes; anon reads the ACTIVE theme only.
create policy themes_select on themes for select to authenticated
  using (is_platform_admin() or is_tenant_member(tenant_id));
create policy themes_anon_active on themes for select to anon
  using (is_active);
create policy themes_write on themes for all to authenticated
  using (is_platform_admin() or has_tenant_permission(tenant_id, 'theme.manage'))
  with check (is_platform_admin() or has_tenant_permission(tenant_id, 'theme.manage'));

-- navigation: members read; navigation.manage writes; anon reads all (menus are
-- public by nature).
create policy navigations_select on navigations for select to authenticated
  using (is_platform_admin() or is_tenant_member(tenant_id));
create policy navigations_anon on navigations for select to anon using (true);
create policy navigations_write on navigations for all to authenticated
  using (is_platform_admin() or has_tenant_permission(tenant_id, 'navigation.manage'))
  with check (is_platform_admin() or has_tenant_permission(tenant_id, 'navigation.manage'));

create policy navigation_items_select on navigation_items for select to authenticated
  using (is_platform_admin() or is_tenant_member(tenant_id));
create policy navigation_items_anon on navigation_items for select to anon using (true);
create policy navigation_items_write on navigation_items for all to authenticated
  using (is_platform_admin() or has_tenant_permission(tenant_id, 'navigation.manage'))
  with check (is_platform_admin() or has_tenant_permission(tenant_id, 'navigation.manage'));
