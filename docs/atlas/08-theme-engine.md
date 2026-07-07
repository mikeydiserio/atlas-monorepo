# Atlas — Theme Engine & UI Library

> Stage 7 deliverable. `packages/theme-engine` + `packages/ui`. Runtime-verified
> (6 SSR checks incl. tenant isolation); mirrored in
> `packages/theme-engine/src/theme.test.tsx`.

## Theme engine (`@atlas/theme-engine`, Tier 1)

Tenant `ThemeTokens` (the ADR-0006 schema stored as `themes.tokens` JSONB) resolve into
the runtime `AtlasTheme` consumed by styled-components:

```
ThemeTokens (DB, Zod-validated)
  └─ buildTheme(tokens, mode) ──▶ AtlasTheme { mode, color, typography, space, radius, shadow, variants }
       └─ <TenantThemeProvider tokens={…} mode="light|dark">  (one per tenant render tree)
            └─ every styled-component reads ${({ theme }) => theme.…}
```

- **Dark mode** — `darkPalette` holds only the overrides; `buildTheme` merges them over
  the base palette, so non-overridden values persist.
- **Defence in depth** — `safeBuildTheme` validates unknown tokens at the render
  boundary; invalid tokens degrade to `defaultTokens` (a neutral platform theme,
  schema-validated at module load) with an `onInvalid` report. A broken theme row never
  takes a site down.
- **Typed theme** — `styled.d.ts` augments styled-components' `DefaultTheme` with
  `AtlasTheme`: platform-wide inference for `${({ theme }) => …}`.
- **Boundary rule** (docs/atlas §01.6): business logic (`cms`, `booking`, `forms`)
  never imports this package. Only `ui` and app render layers do.

## UI library (`@atlas/ui`, Tier 2)

Satūs conventions: styled-components with `$`-transient props behind clean public
wrappers. First primitives: `Button` (primary/secondary/ghost via `theme.variants`
pattern), `Heading` (levels → semantic h1–h3 + theme scale), `Text`, `Card`, `Stack`
(theme-space gaps). Accessibility built in: 44px touch targets, `:focus-visible`
outlines, `text-balance`/`text-pretty`.

Every value comes from the theme — the verified guarantee is that **two tenants render
the same component tree with entirely different emitted CSS, with zero leakage between
sheets**, and dark mode flows through the provider into component CSS.

The starter's richer component set (accordion, select, toast, tabs, …, currently in
`apps/nextjs-starter`) is adopted incrementally by re-exporting through `@atlas/ui` as
Atlas needs each piece — one import surface for consumers, no big-bang rewrite.

---

*Next: [`09-dashboard.md`] — the dashboard app hosting the editor (Stage 8).*
