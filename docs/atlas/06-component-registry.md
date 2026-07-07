# Atlas — Component Registry

> Stage 5 deliverable. `packages/component-registry`: central discovery,
> schema-driven field metadata, prop validation, and version migrations
> (ADR-0005/0006). Runtime-verified end to end with the layout engine; mirrored in
> `packages/component-registry/src/registry.test.tsx`.

## The contract

```ts
interface ComponentDefinition<TProps> {
  id: string                    // stable public contract, e.g. 'hero'
  name: string
  icon: string                  // lucide key for the palette
  category: 'content' | 'media' | 'marketing' | 'navigation' | 'social' | 'module'
  version: number               // current schema version
  schema: z.ZodType<TProps>     // source of truth (ADR-0006)
  defaultProps: TProps
  fields?: Record<string, Partial<EditableFieldSpec>>   // presentation refinements only
  migrations?: Record<number, PropsMigration>           // migrations[1]: v1 → v2
  render: (props: TProps) => ReactNode                  // pure; no layout knowledge
}
```

Components never know about layouts. The registry never contains a switch statement —
`registerComponent` / `getComponent` / `listComponents(category?)`, and duplicate ids
throw because page definitions reference component ids forever.

## Schema-driven field editors (ADR-0006)

`deriveEditableFields(def)` walks the component's Zod object schema and produces the
editor's property panel:

| Schema shape | Derived control |
|---|---|
| `z.string()` | `text` |
| `z.number()` | `number` |
| `z.boolean()` | `boolean` |
| `z.enum([...])` | `select` with options |
| `z.array(...)` | `list` |
| `z.object(...)` | `group` |
| `.optional()` / `.default()` | `required: false` |
| `.describe('…')` | help text |

Authors refine presentation via `fields` (control override like `url`/`image`/
`richtext`, label, grouping, `inline: true` for on-page editing) — but prop **types**
are declared exactly once, in the schema. The editor re-declares nothing.

## Version migrations

Every `ComponentNode` records the schema `version` it was authored against. When a
component evolves, it ships a stepwise migration:

```ts
version: 2,
migrations: { 1: ({ title, ...rest }) => ({ ...rest, heading: title }) }
```

`migrateProps` chains steps (v1→v2→v3…). A missing step degrades to `defaultProps` with
a reported issue — old content never crashes a page. The reference `hero` component ships
at v2 with a real v1→v2 migration so this path is exercised from day one.

## Where the registries meet

`createComponentRenderer({ onIssue, renderUnknown })` produces the `ComponentRenderer`
that apps inject into the layout engine's `PageRenderer`:

```tsx
const renderComponent = createComponentRenderer({ onIssue: log })
<PageRenderer definition={page} renderComponent={renderComponent} />
```

Render pipeline per node: **migrate → validate (safeParse) → render**, degrading to
defaults on any failure. The two Tier-2 registries never import each other; the app
layer is the only place they compose.

`renderUnknown` lets the editor show a placeholder for unregistered components while the
public site renders nothing.

## Reference components

`hero` (v2, with migration) · `rich-text` · `cta` · `image` — semantic, theme-agnostic
markup proving the pattern. The presentational library (Stage 7) styles these same
definitions with theme tokens; contracts don't change for styling. The full catalog
(Gallery, FAQ, Pricing Table, Testimonials, Booking Widget, …) lands with its modules.

---

*Next: [`07-page-editor.md`](./07-page-editor.md) — the visual editing experience
(Stage 6).*
