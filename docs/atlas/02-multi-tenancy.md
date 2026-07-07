# Atlas — Multi-Tenancy

> How Atlas serves thousands of isolated client sites from one codebase and one database.

---

## 1. What a tenant is

Every client is a **tenant**. A tenant is the root of an ownership boundary: every other
resource (users, pages, assets, bookings, themes, domains, forms, templates, analytics)
belongs to exactly one tenant via a non-null `tenant_id`.

```
tenant
 ├── users            (membership + role)
 ├── domains          (one or more hostnames)
 ├── theme            (branding: palette, type, spacing…)
 ├── navigation       (menus)
 ├── pages            (+ versions)
 ├── assets           (Storage-backed)
 ├── forms            (+ submissions)
 ├── bookings         (services, staff, availability, reservations)
 ├── modules          (which optional modules are installed)
 ├── email/sms templates
 ├── seo defaults
 └── analytics events
```

## 2. Isolation strategy — shared schema, RLS-enforced

Atlas uses a **single shared Postgres schema** with **Row Level Security** as the
isolation boundary, rather than schema-per-tenant or database-per-tenant.

| Model | Verdict | Why |
|---|---|---|
| Database per tenant | ✗ | Does not scale to thousands; migrations become N deployments. |
| Schema per tenant | ✗ | Thousands of schemas strain the catalog; cross-tenant platform queries are painful. |
| **Shared schema + RLS** | ✓ | One migration path; scales to thousands; isolation enforced in the engine, not the app. |

See [ADR-0003](./adr/0003-rls-tenant-isolation.md).

### How RLS enforces it

Every tenant-scoped table carries `tenant_id uuid not null` and a policy that admits a
row only when it belongs to a tenant the current user is a member of:

```sql
-- Set once per request from the authenticated session.
-- current_tenant_id() reads a claim / session GUC established at request start.

create policy tenant_isolation on pages
  using (tenant_id = current_tenant_id())
  with check (tenant_id = current_tenant_id());
```

The application *cannot* read or write across tenants even if a query forgets a
`where tenant_id = …`. Application-level scoping is defence in depth, never the fence.

The **platform admin** role bypasses tenant isolation through a separate, explicitly
audited policy path — never by disabling RLS.

## 3. Request → tenant resolution

`apps/website` resolves the incoming host to a tenant in middleware before any render:

```
Request host: acme-dental.com  (or acme.atlas.app, or a custom domain)
  → lookup in `domains` (host → tenant_id), cached
  → attach tenantId to the request context
  → establish the tenant session claim used by RLS
  → proceed to render
```

- A tenant may have **many** domains (apex, www, custom, staging subdomain).
- Unknown host → platform 404 (not a tenant's 404).
- The lookup is cached aggressively and invalidated when domains change.

`apps/dashboard` resolves tenant differently: the signed-in user selects/switches the
active tenant from the tenants they are a member of; the selection drives the RLS claim.

## 4. Per-tenant theming

Presentation is fully tenant-scoped. At render time the tenant's theme object is loaded
and provided to styled-components:

```tsx
<TenantThemeProvider theme={tenant.theme}>
  <PageRenderer definition={page} />
</TenantThemeProvider>
```

Components consume theme tokens (`theme.color.accent`, `theme.space.md`) and never
hard-code presentation. Two tenants render the *same* components with entirely different
looks. Business logic is theme-agnostic. Full contract in Stage 7.

## 5. What is shared vs isolated

| Shared across tenants | Isolated per tenant |
|---|---|
| The application code (all apps + packages) | All content and configuration |
| Component and layout **registries** (the catalog) | Which components/layouts are *used* and their props |
| Module code | Which modules are *installed* + their data |
| Database schema and migrations | Every row of tenant data (RLS) |
| Platform-level roles definition | Role *assignments* per tenant |

Developers ship one component to the registry; every tenant can use it. A tenant using it
cannot affect another tenant using it.

## 6. Scaling notes

- **Indexing:** every tenant-scoped table leads its composite indexes with `tenant_id`
  so per-tenant queries stay selective at thousands of tenants.
- **Caching:** cache keys and revalidation tags are tenant-scoped
  (`tenant:{id}:page:{slug}`), so one tenant's publish never invalidates another's cache.
- **Noisy-neighbour:** rate limiting (see `proxy.ts`) is applied per tenant on the API.
- **Storage:** assets are namespaced by `tenant_id` prefix in Supabase Storage, with
  Storage RLS mirroring table RLS.

---

*Next: [`03-database.md`](./03-database.md) — the schema and RLS policies (Stage 2).*
