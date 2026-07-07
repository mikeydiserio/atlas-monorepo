# Atlas — Database Schema

> Stage 2 deliverable. 27 tables under Supabase/PostgreSQL, every tenant-scoped
> table isolated by Row Level Security. Migrations live in
> [`supabase/migrations`](../../supabase/migrations).

## Migration order

| File | Contents |
|---|---|
| `0001_extensions_and_helpers.sql` | `pgcrypto`, `citext`; `set_updated_at()`, `current_tenant_id()`. |
| `0002_tenancy_and_rbac.sql` | tenants, profiles, permissions, roles, role_permissions, tenant_members; the RLS predicate helpers; seed data. |
| `0003_domains_themes_navigation.sql` | domains, themes, navigations, navigation_items. |
| `0004_pages_and_assets.sql` | pages, page_versions (append-only), assets. |
| `0005_modules_and_forms.sql` | modules, tenant_modules, forms, form_submissions. |
| `0006_bookings.sql` | services, staff, staff_services, availability_rules, availability_exceptions, bookings. |
| `0007_communications_and_analytics.sql` | email_templates, sms_templates, notifications, analytics_events. |

Apply locally with `supabase db reset` (runs all migrations against a clean DB) before
pushing to a remote project.

## Entity map

```
auth.users ──1:1── profiles ──┐
                              │ (membership)
tenants ──1:N── tenant_members ┘──N:1── roles ──N:M── permissions
   │                                     (role_permissions)
   ├──1:N── domains            (host → tenant resolution)
   ├──1:N── themes             (one active per tenant)
   ├──1:N── navigations ──1:N── navigation_items ──?── pages
   ├──1:N── pages ──1:N── page_versions   (published_version_id → page_versions)
   ├──1:N── assets
   ├──N:M── modules            (tenant_modules)
   ├──1:N── forms ──1:N── form_submissions
   ├──1:N── services ──N:M── staff (staff_services)
   ├──1:N── staff ──1:N── availability_rules / availability_exceptions
   ├──1:N── bookings ──N:1── services, staff
   ├──1:N── email_templates / sms_templates
   ├──1:N── notifications      (outbox, drained by apps/worker)
   └──1:N── analytics_events
```

Every table below `tenants` carries `tenant_id uuid not null` and an RLS policy.

## Tenant isolation (ADR-0003)

Isolation is enforced by three `SECURITY DEFINER` helper functions, defined once and
reused by every policy:

| Helper | Meaning |
|---|---|
| `is_platform_admin()` | Current user has the platform-admin flag on their profile. Bypasses tenant scoping through explicit policy branches. |
| `is_tenant_member(tid)` | Current user belongs to tenant `tid`. **The core isolation predicate.** |
| `has_tenant_permission(tid, perm)` | Current user holds RBAC permission `perm` within tenant `tid` (platform admins hold all). |

A typical tenant-scoped policy pair:

```sql
create policy pages_select on pages for select to authenticated
  using (is_platform_admin() or has_tenant_permission(tenant_id, 'page.view'));
create policy pages_update on pages for update to authenticated
  using (has_tenant_permission(tenant_id, 'page.edit'))
  with check (has_tenant_permission(tenant_id, 'page.edit'));
```

Because isolation lives in the database, a forgotten `where tenant_id = …` in
application code cannot leak data across tenants.

### Public (anon) access

The website renderer is unauthenticated, so specific rows are readable by the `anon`
role — but only *published/public* data, never drafts or private records:

| Table | anon can read | anon can write |
|---|---|---|
| pages | `status = 'published'` with a published version | — |
| page_versions | only the row a published page points at | — |
| themes | the active theme | — |
| navigations / navigation_items | yes (menus are public) | — |
| assets | yes (asset URLs are public) | — |
| forms | schema only (to render the form) | — |
| form_submissions | — | **insert** (public form submit); never read |
| services / staff / availability | active rows (booking widget) | — |
| bookings | — | **insert** (public booking); never read others' |
| analytics_events | — | **insert** (client-side tracking); never read |

Server-side operations that must cross these lines (host→tenant routing, the
notification worker, `track()` aggregation) use the Supabase **service role**, which
bypasses RLS and is never exposed to the browser.

## Notable design choices

- **Pages are versioned, page_versions are immutable.** The layout tree lives in
  `page_versions.definition` (JSONB, validated against the `PageDefinition` Zod schema).
  `pages.current_version_id` is the working draft; `pages.published_version_id` is live.
  Update/delete on `page_versions` is blocked by a trigger — history is append-only.
- **JSONB for open shapes, columns for queried fields.** Theme tokens, page SEO/metadata,
  form schemas, and component props are JSONB (their shape is owned by Zod schemas, and
  they are read whole). Anything filtered/sorted (status, slug, tenant_id, timestamps) is
  a real column with an index.
- **Configurable RBAC.** `permissions` is a fixed catalog; `roles` are templates
  (`tenant_id null`) copied per tenant at onboarding, and tenants may define their own.
  `tenant_members.role_id` binds a user to a role within a tenant.
- **Indexes lead with `tenant_id`** on every tenant-scoped table so per-tenant queries
  stay selective at thousands of tenants.
- **Notification outbox.** `notifications` is written by application events and drained by
  `apps/worker`; a partial index on `(status, scheduled_for)` keeps the drain query cheap.

## Reconciliation with Zod (ADR-0006)

Database types are generated with `supabase gen types typescript` and reconciled in tests
against the Zod schemas in `packages/shared`, which remain the authoring source of truth
for JSONB shapes (page definitions, theme tokens, form schemas). A test fails if a JSONB
column's generated type drifts from its schema.

---

*Next: [`04-api-contracts.md`](./04-api-contracts.md) — the page-definition contract as
Zod (Stage 3).*
