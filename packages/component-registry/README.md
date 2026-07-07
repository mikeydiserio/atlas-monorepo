# @atlas/component-registry

**Tier 2.** Central component registry, discovery, and schema-driven field metadata.

## Responsibility

Single responsibility (see [`docs/atlas/01-architecture.md`](../../docs/atlas/01-architecture.md) §3).
This package may only import from lower tiers. It must not introduce a circular dependency.

## Public API (planned)

`componentRegistry`, `registerComponent()`, `getComponent()`, editable-field metadata derivation. No component-specific switch statements.

## Status

Skeleton — implemented in its build stage. See the Atlas build stages in
[`docs/atlas/README.md`](../../docs/atlas/README.md).
