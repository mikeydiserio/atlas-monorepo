# @atlas/notifications

**Tier 2.** Event bus and notification dispatch. Communications are event-driven.

## Responsibility

Single responsibility (see [`docs/atlas/01-architecture.md`](../../docs/atlas/01-architecture.md) §3).
This package may only import from lower tiers. It must not introduce a circular dependency.

## Public API (planned)

Event definitions, `emit()`, subscriber registration, dispatch to email/sms/internal channels.

## Status

Skeleton — implemented in its build stage. See the Atlas build stages in
[`docs/atlas/README.md`](../../docs/atlas/README.md).
