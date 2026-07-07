-- Atlas — 0007 · Communications and analytics
--
-- Email/SMS templates, an event-driven notification outbox, and analytics events.
-- Communications are event-driven (notifications rows are produced by triggers/
-- application events and drained by apps/worker).

create table email_templates (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  key         text not null,          -- 'booking_confirmation', 'reminder', …
  subject     text not null,
  body        text not null,          -- template with {{variables}}
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (tenant_id, key)
);
create index email_templates_tenant_idx on email_templates (tenant_id);
create trigger email_templates_updated_at before update on email_templates
  for each row execute function set_updated_at();

create table sms_templates (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  key         text not null,
  body        text not null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (tenant_id, key)
);
create index sms_templates_tenant_idx on sms_templates (tenant_id);
create trigger sms_templates_updated_at before update on sms_templates
  for each row execute function set_updated_at();

-- Notification outbox: one row per dispatch, drained by apps/worker.
create table notifications (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references tenants(id) on delete cascade,
  event        text not null,         -- 'booking.created', 'form.submitted', …
  channel      text not null check (channel in ('email','sms','internal','webhook')),
  payload      jsonb not null default '{}'::jsonb,
  status       text not null default 'pending'
               check (status in ('pending','processing','sent','failed')),
  attempts     int not null default 0,
  last_error   text,
  scheduled_for timestamptz not null default now(),
  sent_at      timestamptz,
  created_at   timestamptz not null default now()
);
create index notifications_drain_idx on notifications (status, scheduled_for)
  where status in ('pending','processing');
create index notifications_tenant_idx on notifications (tenant_id);

-- Analytics events. Append-heavy; partition-friendly by occurred_at if needed.
create table analytics_events (
  id           bigint generated always as identity primary key,
  tenant_id    uuid not null references tenants(id) on delete cascade,
  name         text not null,
  props        jsonb not null default '{}'::jsonb,
  session_id   text,
  path         text,
  occurred_at  timestamptz not null default now()
);
create index analytics_events_tenant_time_idx on analytics_events (tenant_id, occurred_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table email_templates  enable row level security;
alter table sms_templates    enable row level security;
alter table notifications    enable row level security;
alter table analytics_events enable row level security;

create policy email_templates_select on email_templates for select to authenticated
  using (is_platform_admin() or is_tenant_member(tenant_id));
create policy email_templates_write on email_templates for all to authenticated
  using (is_platform_admin() or has_tenant_permission(tenant_id, 'comms.manage'))
  with check (is_platform_admin() or has_tenant_permission(tenant_id, 'comms.manage'));

create policy sms_templates_select on sms_templates for select to authenticated
  using (is_platform_admin() or is_tenant_member(tenant_id));
create policy sms_templates_write on sms_templates for all to authenticated
  using (is_platform_admin() or has_tenant_permission(tenant_id, 'comms.manage'))
  with check (is_platform_admin() or has_tenant_permission(tenant_id, 'comms.manage'));

-- notifications: readable by members; not client-writable (produced server-side
-- with the service role, which bypasses RLS). No insert/update policy for clients.
create policy notifications_select on notifications for select to authenticated
  using (is_platform_admin() or is_tenant_member(tenant_id));

-- analytics: track() writes go through the service role; anon/auth may INSERT
-- their own events (client-side tracking), members with analytics.view read.
create policy analytics_insert_anon on analytics_events for insert to anon with check (true);
create policy analytics_insert_auth on analytics_events for insert to authenticated with check (true);
create policy analytics_select on analytics_events for select to authenticated
  using (is_platform_admin() or has_tenant_permission(tenant_id, 'analytics.view'));
