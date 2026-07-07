# ADR-0003: Shared schema with RLS for tenant isolation

- **Status:** Accepted
- **Date:** 2026-07-06

## Context

Atlas must isolate thousands of tenants. A tenant must never read or write another
tenant's data — and this guarantee must survive application bugs (a forgotten
`where tenant_id = …`), not merely discourage them.

Three isolation models exist: database-per-tenant, schema-per-tenant, and a shared schema
with row-level policies.

## Decision

Use a **single shared schema** with **PostgreSQL Row Level Security** as the primary
isolation boundary. Every tenant-scoped table has `tenant_id uuid not null` and an RLS
policy admitting only rows belonging to a tenant the caller is a member of. The active
tenant is established per request as a session claim that `current_tenant_id()` reads.

Platform-admin access is a separate, audited policy path — never achieved by disabling
RLS.

## Consequences

- Isolation is enforced in the database engine. Application scoping is defence in depth.
- One migration path for all tenants; onboarding a tenant is inserting a row, not
  provisioning a database.
- Scales to thousands of tenants on shared infrastructure.
- Every tenant-scoped table *must* ship an RLS policy — enforced by a migration lint
  (Stage 2). A table without a policy is a security defect, not a style nit.
- Composite indexes must lead with `tenant_id` to stay selective at scale.

## Alternatives considered

- **Database per tenant** — strongest isolation, but N databases means N migrations and
  no scaling to thousands. Rejected.
- **Schema per tenant** — thousands of schemas bloat the catalog and make platform-wide
  queries painful. Rejected.
- **Application-only scoping** — a single forgotten filter leaks data across tenants. A
  non-starter for a platform holding many clients' data. Rejected.
