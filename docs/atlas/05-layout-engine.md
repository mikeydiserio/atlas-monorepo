# Atlas — Layout Engine

> Stage 4 deliverable. `packages/layout-engine`: the layout registry and the
> Page → Layouts → Regions → Components tree renderer (ADR-0005). Runtime-verified
> via esbuild + `renderToStaticMarkup`; mirrored in
> `packages/layout-engine/src/renderer.test.tsx`.

## The contract

A layout defines **structure only** — which regions exist and how they are arranged.
It never knows what components are: its `render` receives pre-rendered region children
as opaque `ReactNode`s.

```ts
interface LayoutDefinition<TOptions> {
  id: string                       // stable public contract, e.g. 'two-column-70-30'
  name: string
  icon: string                     // lucide key for the editor palette
  regions: RegionDefinition[]      // static regions
  getRegions?: (options) => RegionDefinition[]  // dynamic regions (tabs, accordion)
  optionsSchema: z.ZodType<TOptions>
  defaultOptions: TOptions
  responsive: { stackBelow?, previewWidths? }
  editing: { description?, allowNesting?, category? }
  render: ({ options, regions, responsive }) => ReactNode
}
```

`RegionDefinition` carries `accepts` ('components' | 'layouts' | 'any') and optional
`maxChildren` — the editor enforces both in its drop logic, derived entirely from
this metadata.

## Registry (ADR-0005)

`registerLayout` / `getLayout` / `listLayouts`. Duplicate ids throw — layout ids are
stable public contracts (page definitions reference them forever). Adding a layout is
registration only; no editor or renderer change.

## Renderer

`renderLayoutNode` / `PageRenderer` walk the tree with **zero node-specific branching**:

1. Resolve `node.layoutId` from the registry.
2. Re-validate instance options against the layout's schema (defence in depth — invalid
   options degrade to `defaultOptions`, a published page never crashes).
3. Resolve effective regions (`getRegions(options)` when dynamic).
4. Render each region's children — components via the **injected** `renderComponent`
   callback, nested layouts recursively.
5. Emit `RenderIssue`s for unknown layouts, invalid options, and content authored into
   undeclared regions (surfaced, never silently dropped).

Component rendering is injected because `layout-engine` and `component-registry` are
both Tier 2 — the layout engine cannot and must not import the component registry. This
is also what keeps the engine medium-agnostic.

## Built-in catalog (12)

| Category | Layouts |
|---|---|
| Columns | single-column · two-column-50-50 · two-column-30-70 · two-column-70-30 · three-column · four-column · sidebar |
| Composite | hero-layout · grid · tabs · accordion-layout · carousel |

Notable mechanics:

- **Dynamic regions** — `tabs` and `accordion-layout` derive one region per authored
  item via `getRegions(options)` (`tab:{id}`, `section:{id}`). The editor still
  auto-generates one drop zone per tab/section with no tab-specific code.
- **Grid/carousel cells** — a single region whose children each become a grid item /
  scroll-snap slide.
- **Zero-JS baseline** — accordion uses native `details/summary`; tabs render all panels
  with the first visible; carousel is CSS scroll-snap. Interactivity is progressive
  enhancement added by the UI layer (Stage 7).

## Structural CSS

Inline styles cannot express media queries, so responsive stacking lives in
`structural.css` (exported as `@atlas/layout-engine/structural.css`, imported once per
app). It contains grid/stacking/scroll-snap rules keyed off `data-atlas-*` attributes
and CSS custom properties (`--atlas-cols`, `--atlas-gap`, `--atlas-slide`) — structure
only, no colours, no typography, no theme values.

The same `data-atlas-layout` / `data-atlas-region` attributes are the anchors the page
editor uses to overlay drop zones (Stage 6).

---

*Next: [`06-component-registry.md`](./06-component-registry.md) — component discovery
and schema-driven editing metadata (Stage 5).*
