# @atlas/ui

**Tier 2.** Presentational component library (Base UI primitives + styled-components).

## Responsibility

Single responsibility (see [`docs/atlas/01-architecture.md`](../../docs/atlas/01-architecture.md) §3).
This package may only import from lower tiers. It must not introduce a circular dependency.

## Public API (planned)

Reusable primitives and presentational components consuming theme tokens. No business logic.

## Status

Skeleton — implemented in its build stage. See the Atlas build stages in
[`docs/atlas/README.md`](../../docs/atlas/README.md).
