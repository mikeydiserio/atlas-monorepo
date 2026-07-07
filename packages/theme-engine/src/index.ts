/**
 * @atlas/theme-engine — Tier 1
 *
 * The styled-components theme contract and per-tenant ThemeProvider. Tenant
 * `ThemeTokens` (ADR-0006 schema in @atlas/shared) resolve into the runtime
 * AtlasTheme; dark mode merges `darkPalette` overrides; invalid tokens degrade
 * to platform defaults at the render boundary. Business logic never imports
 * this package — only presentation does (docs/atlas §01.6).
 */

/// <reference path="./styled.d.ts" />
// The DefaultTheme augmentation above has no exports of its own, so nothing
// naturally pulls it into a consumer's compilation. The triple-slash
// reference (type-only, erased — no runtime import) guarantees every program
// that imports this package also loads the augmentation, giving
// `${({ theme }) => …}` platform-wide AtlasTheme inference.

export const PACKAGE_NAME = '@atlas/theme-engine' as const

export * from './theme'
export * from './provider'
