# @atlas/authentication

**Tier 1.** Supabase auth wrappers, session handling, and RBAC guards.

## Responsibility

Single responsibility (see [`docs/atlas/01-architecture.md`](../../docs/atlas/01-architecture.md) §3).
This package may only import from lower tiers. It must not introduce a circular dependency.

## Public API (planned)

`getSession()`, `requireRole()`, `withTenant()`, role/permission definitions, server-side auth guards.

## Status

Skeleton — implemented in its build stage. See the Atlas build stages in
[`docs/atlas/README.md`](../../docs/atlas/README.md).
