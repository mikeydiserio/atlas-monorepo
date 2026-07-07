# @atlas/cms

**Tier 1.** Typed content access layer over Supabase (queries, mutations, realtime).

## Responsibility

Single responsibility (see [`docs/atlas/01-architecture.md`](../../docs/atlas/01-architecture.md) §3).
This package may only import from lower tiers. It must not introduce a circular dependency.

## Public API (planned)

`getPublishedPage()`, `savePageDraft()`, `publishPage()`, tenant/theme/navigation/asset access, realtime subscriptions.

## Status

Skeleton — implemented in its build stage. See the Atlas build stages in
[`docs/atlas/README.md`](../../docs/atlas/README.md).
