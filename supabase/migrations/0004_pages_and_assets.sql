-- Atlas — 0004 · Pages, versions, and assets
--
-- The heart of the platform. A page is data (ADR-0004): its layout tree lives as
-- JSONB in an immutable page_versions row. The page row points at the current
-- draft version and the published version. The website renderer (anon) reads
-- only published content.

-- ---------------------------------------------------------------------------
-- pages
-- ---------------------------------------------------------------------------
create table pages (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             uuid not null references tenants(id) on delete cascade,
  slug                  text not null,
  status                text not null default 'draft'
                        check (status in ('draft','published','scheduled','archived')),
  metadata              jsonb not null default '{}'::jsonb,   -- title, etc.
  seo                   jsonb not null default '{}'::jsonb,   -- title, description, og…
  current_version_id    uuid,     -- latest draft (FK added after page_versions)
  published_version_id  uuid,     -- the live version, if any
  scheduled_for         timestamptz,
  published_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (tenant_id, slug)
);
create index pages_tenant_idx on pages (tenant_id);
create index pages_tenant_status_idx on pages (tenant_id, status);
create trigger pages_updated_at before update on pages
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- page_versions — immutable history. definition is the LayoutNode tree.
-- ---------------------------------------------------------------------------
create table page_versions (
  id           uuid primary key default gen_random_uuid(),
  page_id      uuid not null references pages(id) on delete cascade,
  tenant_id    uuid not null references tenants(id) on delete cascade,
  version      int not null,
  definition   jsonb not null,          -- validated against PageDefinition (Zod)
  note         text,
  created_by   uuid references profiles(id),
  created_at   timestamptz not null default now(),
  unique (page_id, version)
);
create index page_versions_page_idx on page_versions (page_id, version desc);
create index page_versions_tenant_idx on page_versions (tenant_id);

-- Wire the pages → version pointers now that page_versions exists.
alter table pages
  add constraint pages_current_version_fk
    foreign key (current_version_id) references page_versions(id) on delete set null,
  add constraint pages_published_version_fk
    foreign key (published_version_id) references page_versions(id) on delete set null;

-- Wire navigation_items → pages (deferred from 0003).
alter table navigation_items
  add constraint navigation_items_page_fk
    foreign key (page_id) references pages(id) on delete set null;

-- page_versions are append-only: block update/delete at the database.
create or replace function block_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'page_versions is append-only';
end;
$$;
create trigger page_versions_no_update before update on page_versions
  for each row execute function block_mutation();
create trigger page_versions_no_delete before delete on page_versions
  for each row execute function block_mutation();

-- ---------------------------------------------------------------------------
-- assets — Storage-backed media, namespaced by tenant
-- ---------------------------------------------------------------------------
create table assets (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  storage_path  text not null,        -- {tenant_id}/… in the Storage bucket
  filename      text not null,
  mime_type     text not null,
  size_bytes    bigint not null default 0,
  width         int,
  height        int,
  alt           text,
  created_by    uuid references profiles(id),
  created_at    timestamptz not null default now(),
  unique (tenant_id, storage_path)
);
create index assets_tenant_idx on assets (tenant_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table pages         enable row level security;
alter table page_versions enable row level security;
alter table assets        enable row level security;

-- pages: members with page.view read; page.edit writes; anon reads PUBLISHED.
create policy pages_select on pages for select to authenticated
  using (is_platform_admin() or has_tenant_permission(tenant_id, 'page.view'));
create policy pages_anon_published on pages for select to anon
  using (status = 'published' and published_version_id is not null);
create policy pages_insert on pages for insert to authenticated
  with check (has_tenant_permission(tenant_id, 'page.edit'));
create policy pages_update on pages for update to authenticated
  using (has_tenant_permission(tenant_id, 'page.edit'))
  with check (has_tenant_permission(tenant_id, 'page.edit'));
create policy pages_delete on pages for delete to authenticated
  using (has_tenant_permission(tenant_id, 'page.edit'));

-- page_versions: members with page.view read; page.edit inserts (append-only).
-- anon reads only the version that is currently published for its page.
create policy page_versions_select on page_versions for select to authenticated
  using (is_platform_admin() or has_tenant_permission(tenant_id, 'page.view'));
create policy page_versions_anon on page_versions for select to anon
  using (exists (
    select 1 from pages p
    where p.published_version_id = page_versions.id
      and p.status = 'published'
  ));
create policy page_versions_insert on page_versions for insert to authenticated
  with check (has_tenant_permission(tenant_id, 'page.edit'));

-- assets: members with asset.manage manage; anon reads (asset URLs are public).
create policy assets_select on assets for select to authenticated
  using (is_platform_admin() or is_tenant_member(tenant_id));
create policy assets_anon on assets for select to anon using (true);
create policy assets_write on assets for all to authenticated
  using (is_platform_admin() or has_tenant_permission(tenant_id, 'asset.manage'))
  with check (is_platform_admin() or has_tenant_permission(tenant_id, 'asset.manage'));
