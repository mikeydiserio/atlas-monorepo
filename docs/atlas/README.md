# Atlas — Developer-First Website Platform

Atlas is a multi-tenant, API-first website platform that lets a web agency build,
deploy, and maintain many client websites from a single codebase.

It is **not** a WordPress clone, a Squarespace clone, or a drag-and-drop builder for
end users. It is an opinionated, developer-first, schema-driven presentation platform
in the lineage of Sitecore XM Cloud, Contentful, and Shopify.

## Ownership model

| Who | Owns |
|---|---|
| **The agency** | The application (the whole platform). |
| **Clients (tenants)** | Their content — pages, assets, bookings, copy. |
| **Developers** | The components and layouts. |
| **The platform** | The presentation framework that binds them. |

Clients can never break layouts. Developers never duplicate business logic. Everything
is modular, strongly typed, schema-driven, and reusable.

## Documentation map

| Doc | What it covers |
|---|---|
| [`01-architecture.md`](./01-architecture.md) | System architecture, principles, monorepo layout, package dependency graph. |
| [`02-multi-tenancy.md`](./02-multi-tenancy.md) | Tenant model, isolation strategy, domain resolution, per-tenant theming. |
| [`03-database.md`](./03-database.md) | PostgreSQL schema, Row Level Security, ERD. *(Stage 2)* |
| [`04-api-contracts.md`](./04-api-contracts.md) | Headless API, the page-definition contract, Zod as source of truth. *(Stage 3)* |
| [`05-layout-engine.md`](./05-layout-engine.md) | Page → Layouts → Regions → Components; registry-driven layouts. *(Stage 4)* |
| [`06-component-registry.md`](./06-component-registry.md) | Component discovery, schemas, versioning. *(Stage 5)* |
| [`07-page-editor.md`](./07-page-editor.md) | Visual editing experience. *(Stage 6)* |
| [`08-theme-engine.md`](./08-theme-engine.md) | Per-tenant styled-components theming. *(Stage 7)* |
| [`09-modules.md`](./09-modules.md) | Optional installable modules (bookings, forms, comms…). *(Stage 10)* |
| [`adr/`](./adr/) | Architecture Decision Records — the *why* behind each choice. |

## Build stages

Atlas is built incrementally. Each stage left the tree in a coherent state and was
**runtime-verified** before the next began. All ten stages are complete.

1. ✅ **Architecture** — this corpus + 14-package monorepo skeleton ([01](./01-architecture.md), [02](./02-multi-tenancy.md), [ADRs](./adr/)).
2. ✅ **Database schema** — 27 tables, RLS on all, 70 policies ([03](./03-database.md), `supabase/migrations/`).
3. ✅ **API contracts** — Zod source of truth in `@atlas/shared` ([04](./04-api-contracts.md)).
4. ✅ **Layout engine** — 12 registry-driven layouts + tree renderer ([05](./05-layout-engine.md)).
5. ✅ **Component registry** — schema-driven fields + version migrations ([06](./06-component-registry.md)).
6. ✅ **Page editor core** — headless reducer, undo/redo, drop zones ([07](./07-page-editor.md)).
7. ✅ **Theme engine + UI** — per-tenant theming, SSR-verified isolation ([08](./08-theme-engine.md)).
8. ✅ **Dashboard app** — `apps/dashboard` hosting the visual editor ([09](./09-dashboard.md)).
9. ✅ **Website renderer** — `apps/website` multi-tenant catch-all ([10](./10-website.md)).
10. ✅ **Modules** — forms, booking, comms, analytics engines ([11](./11-modules.md)).

**Remaining production wiring** (contracts exist and are tested; implementations are
configuration): `@atlas/cms` + `@atlas/authentication` over the Supabase client,
`apps/worker`'s outbox drain, `apps/api` Route Handlers, `apps/marketing`.

## Relationship to Satūs

Atlas is built additively on top of [Satūs](https://github.com/darkroomengineering/satus),
darkroom.engineering's Next.js 16 starter. The existing root application is the seed of
`apps/website` (the renderer). Atlas introduces the `packages/*` platform layer and the
`apps/*` surfaces around it without rewriting the working starter. See
[ADR-0001](./adr/0001-additive-monorepo.md).
