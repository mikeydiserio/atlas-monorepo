# @atlas/forms

**Tier 2.** Dynamic form engine: schema, validation, conditional fields, submissions, webhooks.

## Responsibility

Single responsibility (see [`docs/atlas/01-architecture.md`](../../docs/atlas/01-architecture.md) §3).
This package may only import from lower tiers. It must not introduce a circular dependency.

## Public API (planned)

`FormSchema`, `FormRenderer`, submission handling, spam protection, file uploads, webhook dispatch.

## Status

Skeleton — implemented in its build stage. See the Atlas build stages in
[`docs/atlas/README.md`](../../docs/atlas/README.md).
