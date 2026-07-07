# ADR-0005: Registry-driven layouts and components

- **Status:** Accepted
- **Date:** 2026-07-06

## Context

The editor and renderer must handle an open, growing set of layouts and components.
If either contains a `switch (componentId)` or a hard-coded map, then every new component
requires editing editor logic and renderer logic — the classic coupling that rots a
platform over years. The brief is explicit: adding a layout or component should be
*registration only*.

## Decision

Layouts and components are declared in **registries**. Each entry carries all metadata the
platform needs:

- **Layout:** `id`, display name, icon, declared `regions`, `options` schema, responsive
  behaviour, editing metadata.
- **Component:** `id`, name, icon, category, `schema` (Zod), default props, validation,
  editable-field metadata, `render`, `version`.

The renderer walks the page tree and resolves each node from the registry. The editor
generates its palette and its editable drop zones **from registry metadata** — drop zones
come from a layout's declared regions, field editors from a component's schema. Neither
contains component- or layout-specific branching.

## Consequences

- Adding a component: author the component, register it. It appears in the palette, is
  editable, and renders — with no editor or renderer changes. Same for layouts.
- The registries are the catalog shared across all tenants (ADR-0003 §5).
- A lint rule / review gate rejects hard-coded component or layout maps outside the
  registries.
- Registries must be discoverable at build (for the renderer/tree-shaking) and at runtime
  (for the editor palette). Both read the same source of truth.

## Alternatives considered

- **Switch/map dispatch** — simplest to start, unmaintainable at scale, violates the
  brief. Rejected.
- **File-convention discovery only** (folder = component) — convenient but hides the rich
  metadata (schema, editable fields, versioning) the editor needs. Rejected as the sole
  mechanism; convention *may* feed the registry, but the registry entry is authoritative.
