-- Atlas — 0006 · Bookings
--
-- Services, staff, recurring availability, exceptions/holidays, and reservations.
-- The public booking widget (anon) reads services/staff/availability to show
-- open slots and INSERTs a booking; staff read/manage bookings via booking.manage.
-- Availability *validity* is enforced in application code (packages/booking);
-- RLS enforces tenant ownership and permission boundaries.

create table services (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references tenants(id) on delete cascade,
  name           text not null,
  description    text,
  duration_min   int not null check (duration_min > 0),
  price_cents    int not null default 0,
  deposit_cents  int not null default 0,
  buffer_before  int not null default 0,   -- minutes
  buffer_after   int not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index services_tenant_idx on services (tenant_id);
create trigger services_updated_at before update on services
  for each row execute function set_updated_at();

create table staff (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  user_id     uuid references profiles(id) on delete set null,
  name        text not null,
  email       citext,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
create index staff_tenant_idx on staff (tenant_id);

create table staff_services (
  staff_id    uuid not null references staff(id) on delete cascade,
  service_id  uuid not null references services(id) on delete cascade,
  primary key (staff_id, service_id)
);

-- Recurring weekly availability. weekday: 0=Sunday … 6=Saturday.
create table availability_rules (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  staff_id    uuid not null references staff(id) on delete cascade,
  weekday     int not null check (weekday between 0 and 6),
  start_time  time not null,
  end_time    time not null,
  check (start_time < end_time)
);
create index availability_rules_staff_idx on availability_rules (staff_id);

-- One-off overrides: a closed day (holiday) or altered hours for a date.
create table availability_exceptions (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  staff_id    uuid not null references staff(id) on delete cascade,
  on_date     date not null,
  is_closed   boolean not null default true,
  start_time  time,
  end_time    time,
  unique (staff_id, on_date)
);
create index availability_exceptions_staff_idx on availability_exceptions (staff_id);

create table bookings (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  service_id      uuid not null references services(id),
  staff_id        uuid references staff(id),
  customer_name   text not null,
  customer_email  citext not null,
  customer_phone  text,
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  status          text not null default 'confirmed'
                  check (status in ('pending','confirmed','cancelled','completed','no_show')),
  deposit_paid    boolean not null default false,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (starts_at < ends_at)
);
create index bookings_tenant_idx on bookings (tenant_id);
create index bookings_staff_time_idx on bookings (staff_id, starts_at);
create trigger bookings_updated_at before update on bookings
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table services                enable row level security;
alter table staff                   enable row level security;
alter table staff_services          enable row level security;
alter table availability_rules      enable row level security;
alter table availability_exceptions enable row level security;
alter table bookings                enable row level security;

-- Helper: standard member-read / booking.manage-write with anon read for the
-- public booking widget. Applied per-table below.

create policy services_anon on services for select to anon using (is_active);
create policy services_select on services for select to authenticated
  using (is_platform_admin() or is_tenant_member(tenant_id));
create policy services_write on services for all to authenticated
  using (is_platform_admin() or has_tenant_permission(tenant_id, 'booking.manage'))
  with check (is_platform_admin() or has_tenant_permission(tenant_id, 'booking.manage'));

create policy staff_anon on staff for select to anon using (is_active);
create policy staff_select on staff for select to authenticated
  using (is_platform_admin() or is_tenant_member(tenant_id));
create policy staff_write on staff for all to authenticated
  using (is_platform_admin() or has_tenant_permission(tenant_id, 'booking.manage'))
  with check (is_platform_admin() or has_tenant_permission(tenant_id, 'booking.manage'));

create policy staff_services_anon on staff_services for select to anon using (true);
create policy staff_services_select on staff_services for select to authenticated using (true);
create policy staff_services_write on staff_services for all to authenticated
  using (exists (select 1 from staff s where s.id = staff_id
                 and has_tenant_permission(s.tenant_id, 'booking.manage')))
  with check (exists (select 1 from staff s where s.id = staff_id
                 and has_tenant_permission(s.tenant_id, 'booking.manage')));

create policy avail_rules_anon on availability_rules for select to anon using (true);
create policy avail_rules_select on availability_rules for select to authenticated
  using (is_platform_admin() or is_tenant_member(tenant_id));
create policy avail_rules_write on availability_rules for all to authenticated
  using (is_platform_admin() or has_tenant_permission(tenant_id, 'booking.manage'))
  with check (is_platform_admin() or has_tenant_permission(tenant_id, 'booking.manage'));

create policy avail_exc_anon on availability_exceptions for select to anon using (true);
create policy avail_exc_select on availability_exceptions for select to authenticated
  using (is_platform_admin() or is_tenant_member(tenant_id));
create policy avail_exc_write on availability_exceptions for all to authenticated
  using (is_platform_admin() or has_tenant_permission(tenant_id, 'booking.manage'))
  with check (is_platform_admin() or has_tenant_permission(tenant_id, 'booking.manage'));

-- bookings: public may create (with valid service for the tenant); staff manage.
-- Public cannot read others' bookings.
create policy bookings_insert_anon on bookings for insert to anon
  with check (exists (select 1 from services s
                      where s.id = service_id and s.tenant_id = bookings.tenant_id and s.is_active));
create policy bookings_insert_auth on bookings for insert to authenticated
  with check (exists (select 1 from services s
                      where s.id = service_id and s.tenant_id = bookings.tenant_id));
create policy bookings_select on bookings for select to authenticated
  using (is_platform_admin() or has_tenant_permission(tenant_id, 'booking.manage'));
create policy bookings_update on bookings for update to authenticated
  using (has_tenant_permission(tenant_id, 'booking.manage'))
  with check (has_tenant_permission(tenant_id, 'booking.manage'));
create policy bookings_delete on bookings for delete to authenticated
  using (has_tenant_permission(tenant_id, 'booking.manage'));
