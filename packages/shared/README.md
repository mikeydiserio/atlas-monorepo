# @atlas/shared

**Tier 0.** Zod schemas, domain types, constants, pure utilities. Source of truth. No internal dependencies.

## Responsibility

Single responsibility (see [`docs/atlas/01-architecture.md`](../../docs/atlas/01-architecture.md) §3).
This package may only import from lower tiers. It must not introduce a circular dependency.

## Public API (planned)

Zod schemas for every platform entity (page definition, layout node, component node, tenant, theme, form field). Types via `z.infer`. Pure utilities and constants.

## Status

Skeleton — implemented in its build stage. See the Atlas build stages in
[`docs/atlas/README.md`](../../docs/atlas/README.md).
