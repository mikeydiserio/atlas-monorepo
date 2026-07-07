# ADR-0006: Zod schemas as the single source of truth

- **Status:** Accepted
- **Date:** 2026-07-06

## Context

The same entities appear in many places: TypeScript types, runtime validation, API
payloads, database contracts, editor field generation, and form validation. If each
place re-declares the shape, they drift, and drift in a ten-year platform is death by a
thousand mismatches.

Satūs already uses this pattern (integration env schemas drive `doctor`, server-action
validation, and client form validation from one Zod definition).

## Decision

**Zod schemas in `packages/shared` are the single source of truth** for every platform
entity (page definition, layout node, component node, tenant, theme, form field, etc.).

- Types derive via `z.infer` — no hand-written interfaces for schema-backed entities.
- API Route Handlers validate input/output against the schema.
- The page editor derives field editors from a component's schema (editable-field
  metadata annotates the schema).
- Client forms bridge the same schema to React Hook Form.
- Database-generated types (ADR-0002) are reconciled against these schemas in tests.

## Consequences

- One change to a schema propagates to types, validation, API, and editor — no manual
  synchronisation.
- Validation exists at every boundary by construction, satisfying the strong-typing
  principle.
- Zod becomes a load-bearing dependency across the platform. Accepted: it already is in
  Satūs, and its role here is architectural, not incidental.
- Schema evolution needs discipline: component instances record the `version` they were
  authored against so old content keeps validating and rendering (migration path per
  component). See ADR-0005.

## Alternatives considered

- **TypeScript types + separate validators** — types don't exist at runtime; validators
  drift from types. Rejected.
- **JSON Schema** — language-neutral, but weaker TS inference and ergonomics than Zod for
  a TS-first platform. Rejected; Zod can emit JSON Schema if an external consumer needs
  it.
