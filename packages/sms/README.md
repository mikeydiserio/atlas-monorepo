# @atlas/sms

**Tier 2.** SMS provider abstraction and templates.

## Responsibility

Single responsibility (see [`docs/atlas/01-architecture.md`](../../docs/atlas/01-architecture.md) §3).
This package may only import from lower tiers. It must not introduce a circular dependency.

## Public API (planned)

`SmsProvider` interface, template rendering, send API. Provider-agnostic.

## Status

Skeleton — implemented in its build stage. See the Atlas build stages in
[`docs/atlas/README.md`](../../docs/atlas/README.md).
