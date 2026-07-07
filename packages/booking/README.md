# @atlas/booking

**Tier 2.** Bookings domain: services, staff, availability, recurring schedules, reservations.

## Responsibility

Single responsibility (see [`docs/atlas/01-architecture.md`](../../docs/atlas/01-architecture.md) §3).
This package may only import from lower tiers. It must not introduce a circular dependency.

## Public API (planned)

Availability computation, service/staff models, reservation lifecycle (create/cancel/reschedule), buffers, deposits.

## Status

Skeleton — implemented in its build stage. See the Atlas build stages in
[`docs/atlas/README.md`](../../docs/atlas/README.md).
