# Atlas — API Contracts

> Stage 3 deliverable. The headless API returns structured page definitions, never
> HTML (ADR-0004). Every contract is a Zod schema in
> [`packages/shared`](../../packages/shared) (ADR-0006) — validated at runtime in
> Stage 3 and covered by `packages/shared/src/page.test.ts`.

## Source of truth

`packages/shared` exports the schema and inferred type for every entity:

| Module | Exports |
|---|---|
| `rbac.ts` | `PERMISSIONS`, `permissionSchema`, `SYSTEM_ROLES`, `roleSchema` |
| `tenant.ts` | `tenantSchema`, `domainSchema`, `tenantStatusSchema` |
| `theme.ts` | `themeTokensSchema`, `themeSchema` (palette, typography, space, radius, shadow, variants, dark mode) |
| `seo.ts` | `seoSchema`, `pageMetadataSchema` |
| `page.ts` | `componentNodeSchema`, `layoutNodeSchema`, `pageDefinitionSchema`, `walkComponents()` |
| `form.ts` | `formFieldSchema`, `formSchemaSchema`, `formDefinitionSchema` |
| `api.ts` | `apiResponse()`, `apiErrorSchema`, `paginationSchema`, `API_VERSION` |

Types are never hand-written for these entities — always `z.infer`. The DB-generated
types (ADR-0002) are reconciled against these in tests.

## The response envelope

Every API response is a discriminated union so consumers get a uniform shape and stable
error codes:

```ts
type ApiResponse<T> =
  | { ok: true;  data: T }
  | { ok: false; error: { code: ApiErrorCode; message: string; issues?: Record<string, string[]> } }
```

`apiResponse(payloadSchema)` builds the runtime validator for any endpoint.

Error codes: `unauthorized · forbidden · not_found · validation_error · conflict ·
rate_limited · internal_error`.

## Endpoint surface (apps/api — Route Handlers)

All content endpoints return page definitions or entity data — never markup.

| Method | Path | Returns | Auth |
|---|---|---|---|
| `GET` | `/v1/sites/:host/pages/:slug` | `PageDefinition` (published) | public (anon) |
| `GET` | `/v1/sites/:host/navigation/:key` | navigation tree | public |
| `GET` | `/v1/sites/:host/theme` | active `Theme` | public |
| `GET` | `/v1/tenants/:id/pages` | `PageDefinition[]` (paginated, all statuses) | `page.view` |
| `POST` | `/v1/tenants/:id/pages` | created `PageDefinition` (draft) | `page.edit` |
| `PUT` | `/v1/tenants/:id/pages/:pageId/draft` | new draft version | `page.edit` |
| `POST` | `/v1/tenants/:id/pages/:pageId/publish` | published `PageDefinition` | `page.publish` |
| `POST` | `/v1/sites/:host/forms/:key/submit` | submission receipt | public (anon) |
| `POST` | `/v1/sites/:host/bookings` | booking receipt | public (anon) |

Host resolution (`:host` → tenant) and any cross-tenant read use the Supabase service
role server-side (see [`02-multi-tenancy.md`](./02-multi-tenancy.md) §3). Authenticated
mutations run in the user's session so RLS applies.

Rate limiting for `/v1/*` is applied per tenant via `proxy.ts` (the existing Satūs
request proxy).

## Server Actions vs Route Handlers

- **Route Handlers (`apps/api`)** — the stable, versioned, multi-consumer surface. Used
  by `apps/website`, and by any future surface (mobile, kiosk, signage).
- **Server Actions (`apps/dashboard`)** — the editor's write path. They validate against
  the same Zod schemas and call `packages/cms`. Actions are an internal convenience for
  the dashboard; they are not the public contract.

Both paths validate with the *same* schemas, so there is one definition of "a valid page"
regardless of how it is written.

## Versioning

- The page model is a public contract. `API_VERSION` (a date string) tags the envelope;
  breaking changes to `PageDefinition` bump it and are served under a new `/vN` prefix.
- Component evolution is handled *inside* a stable page model: each `ComponentNode`
  records the schema `version` it was authored against, so a component can ship a v2
  schema while v1 instances keep validating and rendering via a per-component migration
  (Stage 5). This means most component changes never require an API version bump.

---

*Next: [`05-layout-engine.md`](./05-layout-engine.md) — the layout registry and tree
renderer (Stage 4).*
