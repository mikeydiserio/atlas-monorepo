# Atlas — System Architecture

> Stage 1 deliverable. The complete architecture, designed to be maintained and
> extended for ten years. Every decision favours long-term maintainability over
> short-term convenience.

---

## 1. Principles

These are load-bearing. Code that violates them is wrong even if it works.

1. **API-first / headless.** The API never returns HTML. It returns structured
   *page definitions* (JSON). Rendering happens entirely in the frontend. Any future
   surface — mobile, kiosk, digital signage — consumes the same content model.
2. **Pages are data, not markup.** A page is a JSON document: metadata, SEO, a layout
   tree, components, navigation, and publishing state. See §5.
3. **Schema-driven everything.** Zod schemas in `packages/shared` are the single source
   of truth. Types, validation, database contracts, editor field generation, and API
   payloads all derive from them. One schema, many consumers.
4. **Registry over switch statements.** Layouts and components are discovered from
   registries. Adding a layout or component is *registration only* — no editor logic,
   no renderer `switch`, no hard-coded map changes.
5. **Separation of concerns is structural, not conventional.** Layouts know page
   structure and nothing about component implementations. Components know their own
   rendering and nothing about layouts. The theme carries presentation; business logic
   never depends on the theme.
6. **Strong typing end to end.** `strict` TypeScript, `noUncheckedIndexedAccess`. No
   `any`. Validate `unknown` at every boundary.
7. **Tenant isolation is enforced at the database.** Row Level Security is the primary
   boundary, not application code. Application code is defence in depth, not the fence.
8. **Additive and reversible.** New capability is added alongside existing code, never
   by rewriting working code in place. Mirrors the Satūs "additive setup / self-pruning"
   philosophy already in this repo.

---

## 2. Actors and surfaces

```
                         ┌───────────────────────────────┐
                         │         Supabase              │
                         │  Postgres · Auth · Storage    │
                         │  Realtime · RLS · Edge Fns    │
                         └──────────────┬────────────────┘
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              │                         │                         │
        ┌─────┴──────┐          ┌───────┴────────┐        ┌───────┴───────┐
        │ apps/api   │          │ apps/dashboard │        │ apps/worker   │
        │ headless   │          │ agency + tenant│        │ event-driven  │
        │ page defs  │          │ admin + editor │        │ jobs, comms   │
        └─────┬──────┘          └───────┬────────┘        └───────────────┘
              │                         │
              │ page definitions (JSON) │ authoring writes
              ▼                         ▼
        ┌───────────────────────────────────────────┐
        │              apps/website                 │
        │  domain → tenant resolution               │
        │  renders page defs via platform packages  │
        │  per-tenant ThemeProvider                 │
        └───────────────────────────────────────────┘
```

- **`apps/dashboard`** — where developers configure and clients author. Hosts the visual
  page editor. Writes page definitions and tenant config.
- **`apps/website`** — the renderer. Resolves an incoming host to a tenant, fetches the
  published page definition, and renders it. Multi-tenant by domain. Grows out of the
  existing Satūs root app.
- **`apps/api`** — the headless surface. Route Handlers that return page definitions and
  content for any consumer. Never returns HTML.
- **`apps/worker`** — processes the event bus: confirmation emails, SMS reminders,
  calendar invites, webhooks, scheduled publishing.
- **`apps/marketing`** — the agency's own marketing site (dogfoods the platform).

---

## 3. Monorepo layout

pnpm workspaces. Each package has one responsibility. No circular dependencies
(enforced — see §6).

```
apps/
  dashboard/        Agency + tenant admin, hosts the page editor
  website/          Multi-tenant renderer (from existing Satūs app)
  api/              Headless API — returns page definitions, never HTML
  worker/           Event-driven jobs & communications
  marketing/        Agency marketing site

packages/
  shared/           Zod schemas, domain types, constants, pure utils. Depends on nothing.
  authentication/   Supabase auth wrappers, session, RBAC guards
  cms/              Content access layer over Supabase (queries, mutations, realtime)
  theme-engine/     styled-components theme contract + per-tenant ThemeProvider
  ui/               Presentational component library (Base UI + styled-components)
  layout-engine/    Layout registry + Page→Layouts→Regions→Components tree renderer
  component-registry/ Component registry + discovery + schema-driven field metadata
  page-builder/     Visual editor primitives (drop zones, DnD, inline edit, history)
  forms/            Dynamic form engine (schema, validation, submissions, webhooks)
  booking/          Bookings domain (services, staff, availability, reservations)
  email/            Email provider abstraction + templates
  sms/              SMS provider abstraction + templates
  notifications/    Event bus + notification dispatch
  analytics/        Event capture + reporting
```

### Package tiers

Dependencies only ever point *downward* through tiers.

```
Tier 0  shared                      (no internal deps)
Tier 1  authentication · theme-engine · cms
Tier 2  ui · layout-engine · component-registry · forms · booking
                                    · email · sms · notifications · analytics
Tier 3  page-builder                (composes ui + registries + layout-engine)
Apps    dashboard · website · api · worker · marketing
```

Rule: a package may import from any package in a **lower** tier, never the same tier or
higher. `shared` imports nothing internal. Apps sit above all packages and may import
any of them.

---

## 4. Data flow

### Authoring (write path)

```
Editor (apps/dashboard)
  → validates draft against Zod page schema (packages/shared)
  → cms.savePageDraft() (packages/cms)
  → Supabase (RLS enforces tenant + role)
  → version row appended (immutable history)
  → optional: schedule publish → apps/worker
```

### Publishing

```
Publish action
  → cms.publishPage(): copies draft → published, writes publish event
  → revalidateTag(`tenant:${id}:page:${slug}`)
  → apps/website ISR cache invalidated for that tenant+page only
```

### Rendering (read path)

```
Request to client-domain.com
  → apps/website middleware resolves host → tenant
  → cms.getPublishedPage(tenant, slug)  (cached, ISR)
  → validate against page schema (defence in depth)
  → <TenantThemeProvider theme={tenant.theme}>
      <PageRenderer definition={page} />   (packages/layout-engine)
        → for each layout node: resolve from layout registry
          → for each region: render components from component registry
    </TenantThemeProvider>
```

The renderer contains **zero** knowledge of specific layouts or components. It walks the
tree and asks the registries. New layouts/components appear automatically.

---

## 5. The page model (contract preview)

Full Zod definition lands in Stage 3 (`packages/shared`). Shape:

```ts
type PageDefinition = {
  id: string
  tenantId: string
  slug: string
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  version: number
  metadata: { title: string; description?: string; ... }
  seo: { title?: string; description?: string; ogImage?: string; canonical?: string; ... }
  layout: LayoutNode          // the root of the layout tree
  publishedAt?: string
  scheduledFor?: string
}

type LayoutNode = {
  id: string                  // instance id (unique within the page)
  layoutId: string            // registry key, e.g. 'two-column-70-30'
  options: Record<string, unknown>   // validated against the layout's options schema
  regions: Record<string, ComponentNode[]>   // keyed by the layout's declared regions
}

type ComponentNode = {
  id: string                  // instance id
  componentId: string         // registry key, e.g. 'hero'
  version: number             // component schema version this instance was authored against
  props: Record<string, unknown>      // validated against the component's schema
}
```

Layout nodes may nest (a region can contain layouts as well as components) — this is how
Grid/Tabs/Accordion/Carousel layouts compose. See Stage 4.

---

## 6. Guardrails (how the principles are enforced)

- **No circular dependencies.** Enforced by tier rule (§3) and a CI check
  (`madge --circular` or `deslop-cli`, already a devDependency here).
- **Registry-only extension.** The renderer has no `switch (componentId)`. A lint rule
  and code review reject hard-coded component/layout maps outside the registries.
- **Schema is source of truth.** No hand-written types for entities that have a Zod
  schema; use `z.infer`. Editor field metadata is derived from the schema, not
  re-declared.
- **RLS-first.** Every table with a `tenant_id` has an RLS policy. A migration lint
  fails the build if a tenant-scoped table ships without one (Stage 2).
- **Theme independence.** `packages/*` business logic (booking, forms, cms) must not
  import `theme-engine`. Only `ui` and app render layers consume the theme.

---

## 7. Technology stack

Fixed by the brief; chosen for longevity.

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server Components, Server Actions, Route Handlers first. |
| UI runtime | React 19 | React Compiler on — no manual memoization. |
| Language | TypeScript (strict) | `noUncheckedIndexedAccess`. |
| Styling | styled-components 6 | Per-tenant `ThemeProvider`; `$`-transient props; Base UI primitives. |
| Backend | Supabase | Postgres, Auth, Storage, Realtime, RLS, Edge Functions. |
| Validation | Zod 4 | Single source of truth. |
| Forms | React Hook Form + Zod | Client validation bridges the same schemas. |
| Server cache | TanStack Query | Client-side reads/mutations where SC/RH don't fit. |

No ORM is introduced — the official Supabase client plus PostgreSQL features are the data
layer. See [ADR-0002](./adr/0002-supabase-no-orm.md). No dependency is added unless it
provides genuine architectural value.

---

## 8. Non-functional targets

- **Scale:** thousands of tenants on shared infrastructure; tenant isolation by RLS.
- **Performance:** Server Components, ISR, streaming, image optimization, per-tenant
  cache tags so one tenant's publish never invalidates another's.
- **Accessibility & SEO:** first-class, not bolted on. Page definitions carry SEO;
  renderer emits semantic HTML and metadata.
- **Testing:** Vitest + React Testing Library (unit/component), Playwright (E2E).
  Critical modules (auth, RLS, page model, publishing) must have automated tests.

---

*See [`adr/`](./adr/) for the decisions behind this architecture.*
