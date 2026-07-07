# @atlas/theme-engine

**Tier 1.** styled-components theme contract and per-tenant ThemeProvider.

## Responsibility

Single responsibility (see [`docs/atlas/01-architecture.md`](../../docs/atlas/01-architecture.md) §3).
This package may only import from lower tiers. It must not introduce a circular dependency.

## Public API (planned)

`Theme` contract, `TenantThemeProvider`, token accessors, dark-mode support, theme validation.

## Status

Skeleton — implemented in its build stage. See the Atlas build stages in
[`docs/atlas/README.md`](../../docs/atlas/README.md).
