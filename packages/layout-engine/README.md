# @atlas/layout-engine

**Tier 2.** Layout registry and the Page to Layouts to Regions to Components tree renderer.

## Responsibility

Single responsibility (see [`docs/atlas/01-architecture.md`](../../docs/atlas/01-architecture.md) §3).
This package may only import from lower tiers. It must not introduce a circular dependency.

## Public API (planned)

`layoutRegistry`, `registerLayout()`, `PageRenderer`, `RegionRenderer`. Renderer contains no layout-specific branching.

## Status

Skeleton — implemented in its build stage. See the Atlas build stages in
[`docs/atlas/README.md`](../../docs/atlas/README.md).
