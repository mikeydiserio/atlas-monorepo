-- Atlas — 0005 · Modules and forms
--
-- Modules are optional, independently-installable capabilities. Forms are the
-- dynamic form engine. Note the asymmetric form_submissions policy: the public
-- (anon) may INSERT a submission (that's the whole point of a public form) but
-- may never SELECT them — only form.manage holders read submissions.

-- ---------------------------------------------------------------------------
-- modules — shared catalog (no tenant) + per-tenant installation
-- ---------------------------------------------------------------------------
create table modules (
  key          text primary key,       -- 'booking','forms','blog','crm',…
  name         text not null,
  description  text not null,
  version      text not null default '1.0.0'
);

create table tenant_modules (
  tenant_id    uuid not null references tenants(id) on delete cascade,
  module_key   text not null references modules(key) on delete cascade,
  enabled      boolean not null default true,
  config       jsonb not null default '{}'::jsonb,
  installed_at timestamptz not null default now(),
  primary key (tenant_id, module_key)
);

insert into modules (key, name, description) values
  ('bookings',      'Bookings',       'Services, staff, availability, and reservations'),
  ('forms',         'Forms',          'Dynamic forms with validation and submissions'),
  ('crm',           'CRM',            'Contacts and lead management'),
  ('blog',          'Blog',           'Articles and feeds'),
  ('events',        'Events',         'Event listings and registration'),
  ('email',         'Email',          'Transactional and marketing email'),
  ('sms',           'SMS',            'Transactional SMS'),
  ('payments',      'Payments',       'Deposits and payments'),
  ('memberships',   'Memberships',    'Gated content and member tiers'),
  ('support',       'Support Tickets','Customer support tickets'),
  ('knowledge_base','Knowledge Base', 'Help articles'),
  ('newsletter',    'Newsletter',     'Subscriber list and campaigns');

-- ---------------------------------------------------------------------------
-- forms
-- ---------------------------------------------------------------------------
create table forms (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  key         text not null,
  name        text not null,
  schema      jsonb not null default '{}'::jsonb,   -- FormSchema (Zod-validated)
  settings    jsonb not null default '{}'::jsonb,   -- notifications, webhooks, success page
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (tenant_id, key)
);
create index forms_tenant_idx on forms (tenant_id);
create trigger forms_updated_at before update on forms
  for each row execute function set_updated_at();

create table form_submissions (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  form_id     uuid not null references forms(id) on delete cascade,
  data        jsonb not null,
  meta        jsonb not null default '{}'::jsonb,   -- ip hash, user agent, referrer
  created_at  timestamptz not null default now()
);
create index form_submissions_form_idx on form_submissions (form_id, created_at desc);
create index form_submissions_tenant_idx on form_submissions (tenant_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table modules          enable row level security;
alter table tenant_modules   enable row level security;
alter table forms            enable row level security;
alter table form_submissions enable row level security;

create policy modules_read on modules for select to authenticated using (true);

create policy tenant_modules_select on tenant_modules for select to authenticated
  using (is_platform_admin() or is_tenant_member(tenant_id));
create policy tenant_modules_write on tenant_modules for all to authenticated
  using (is_platform_admin() or has_tenant_permission(tenant_id, 'module.manage'))
  with check (is_platform_admin() or has_tenant_permission(tenant_id, 'module.manage'));

-- forms: form.manage manages; anon reads the schema (needed to render the form).
create policy forms_select on forms for select to authenticated
  using (is_platform_admin() or is_tenant_member(tenant_id));
create policy forms_anon on forms for select to anon using (true);
create policy forms_write on forms for all to authenticated
  using (is_platform_admin() or has_tenant_permission(tenant_id, 'form.manage'))
  with check (is_platform_admin() or has_tenant_permission(tenant_id, 'form.manage'));

-- form_submissions: anon may INSERT (public form submit); only form.manage reads.
create policy form_submissions_insert_anon on form_submissions for insert to anon
  with check (
    exists (select 1 from forms f where f.id = form_id and f.tenant_id = form_submissions.tenant_id)
  );
create policy form_submissions_insert_auth on form_submissions for insert to authenticated
  with check (
    exists (select 1 from forms f where f.id = form_id and f.tenant_id = form_submissions.tenant_id)
  );
create policy form_submissions_select on form_submissions for select to authenticated
  using (is_platform_admin() or has_tenant_permission(tenant_id, 'form.manage'));
