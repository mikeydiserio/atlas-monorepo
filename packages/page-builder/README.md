# @atlas/page-builder

**Tier 3.** Visual editor primitives: drop zones, drag-and-drop, inline edit, history.

## Responsibility

Single responsibility (see [`docs/atlas/01-architecture.md`](../../docs/atlas/01-architecture.md) §3).
This package may only import from lower tiers. It must not introduce a circular dependency.

## Public API (planned)

`EditableRegion`, `ComponentPalette`, DnD controllers, undo/redo history, inline-edit bindings. Drop zones generated from layout metadata.

## Status

Skeleton — implemented in its build stage. See the Atlas build stages in
[`docs/atlas/README.md`](../../docs/atlas/README.md).
