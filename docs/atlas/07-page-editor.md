# Atlas — Page Editor

> Stage 6 deliverable. `packages/page-builder`: the visual editor's core as a
> pure, headless state layer (15 runtime-verified checks; mirrored in
> `packages/page-builder/src/editor.test.ts`). The dashboard's DnD/UI chrome
> (Stage 8) is a thin consumer of this model — editing logic never lives in UI.

## Design position

Sitecore XM Cloud-style editing means the editor manipulates **the same page
definition the renderer draws** — no parallel form model. So the editor core is:

1. **Pure tree operations** (`tree.ts`) — immutable transforms on the `LayoutNode` tree
   with structural sharing: `findNode`, `insertChild`, `removeNode`, `moveNode` (with
   same-region index adjustment + descendant guard), `duplicateNode` (deep clone, fresh
   ids), `updateComponentProps`, `updateLayoutOptions`.
2. **A reducer** (`store.ts`) — `editorReducer(state, action)` with actions for
   add/remove/duplicate/move/reorder/update/select/undo/redo. New nodes are seeded from
   the registries (`createComponentNode` records the component's **current version** and
   `defaultProps`; `createLayoutNode` seeds empty regions via `resolveRegions`, dynamic
   ones included).
3. **Undo/redo** — because trees are immutable, history is snapshot stacks (`past`/
   `future`, capped at 100). Redo restores reference-identical snapshots.
4. **Registry-derived editing surfaces:**
   - `collectDropZones(tree)` — every region in document order with `accepts`,
     `childCount`, `maxChildren` from layout metadata (ADR-0005).
   - `canDrop(tree, item, zone)` — pure verdicts: `kind-not-accepted`, `region-full`
     (moving a resident child within a full region stays legal), `own-descendant`.
   - `buildPalette()` — grouped entries from `listComponents()` + `listLayouts()`.
   - `inlineBindingsFor(tree, nodeId)` — the `inline: true` editable fields with
     current values, for on-page contenteditable overlays.
5. **Thin React adapter** (`react.ts`) — `usePageEditor` wraps the reducer in
   `useReducer` and supplies `crypto.randomUUID()` ids. Nothing more.

## Why headless-first

- Every editor behaviour is testable without a browser, DnD library, or React.
- The DnD chrome can be swapped (pointer events, `@dnd-kit`, native HTML5) without
  touching editing semantics.
- Draft persistence is trivial: `state.page` **is** a valid `PageDefinition` at all
  times — `cms.savePageDraft(state.page)` and the publish workflow (Stage 8) need no
  translation layer. `dirty`/`mark-saved` track save state.

## Editing flow (dashboard, Stage 8)

```
palette drag  ──▶ canDrop(zone)? ──▶ dispatch add-component/add-layout
canvas drag   ──▶ canDrop(zone)? ──▶ dispatch move
inline edit   ──▶ inlineBindingsFor ──▶ dispatch update-props (per field)
inspector     ──▶ deriveEditableFields ──▶ dispatch update-props/update-options
toolbar       ──▶ undo/redo/duplicate/remove · draft save · publish
```

The rendered canvas is the real `PageRenderer` output; drop zones overlay on the
`data-atlas-region` anchors emitted by layouts (Stage 4). Versions, scheduled
publishing, and preview state ride on the Stage 2 schema (`page_versions`,
`pages.scheduled_for`).

---

*Next: [`08-theme-engine.md`](./08-theme-engine.md) — per-tenant theming (Stage 7).*
