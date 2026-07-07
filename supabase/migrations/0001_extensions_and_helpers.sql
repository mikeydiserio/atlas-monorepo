-- Atlas — 0001 · Extensions and RLS helper functions
--
-- Foundation for tenant isolation (ADR-0003). Every tenant-scoped table's RLS
-- policy is expressed in terms of the helpers defined here, so isolation logic
-- lives in exactly one place.

create extension if not exists pgcrypto;      -- gen_random_uuid()
create extension if not exists citext;        -- case-insensitive text (emails, hostnames)

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Identity / tenancy helpers
--
-- These are SECURITY DEFINER with a pinned search_path so that RLS policies can
-- call them without themselves being subject to the caller's RLS (which would
-- recurse). They are STABLE (one value per statement) for planner efficiency.
-- ---------------------------------------------------------------------------

-- NOTE: the table-dependent predicates is_platform_admin(), is_tenant_member(),
-- and has_tenant_permission() are defined in 0002, immediately after the tables
-- they read. `language sql` bodies are validated against the catalog at CREATE
-- time, so they cannot be declared here before those tables exist.

-- The active tenant for this session, if the client has selected one
-- (set via select set_config('app.current_tenant_id', '<uuid>', true)).
-- Used to scope writes to the currently-selected tenant as defence in depth;
-- isolation itself is enforced by is_tenant_member() in policies.
create or replace function current_tenant_id()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('app.current_tenant_id', true), '')::uuid;
$$;
