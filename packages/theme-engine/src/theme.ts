import { themeTokensSchema, type ThemeTokens } from '@atlas/shared'

/**
 * Theme resolution. Tenant `ThemeTokens` (validated JSONB from `themes.tokens`)
 * resolve into the runtime `AtlasTheme` consumed by styled-components. All
 * presentation flows through this object; business logic never reads it.
 */

export type ThemeMode = 'light' | 'dark'

export interface AtlasTheme {
  mode: ThemeMode
  color: ThemeTokens['palette']
  typography: ThemeTokens['typography']
  space: ThemeTokens['space']
  radius: ThemeTokens['radius']
  shadow: ThemeTokens['shadow']
  variants: ThemeTokens['variants']
}

/** Neutral default tokens — the fallback when a tenant theme is missing or
 * invalid, and the seed for new tenants. Validated at module load. */
export const defaultTokens: ThemeTokens = themeTokensSchema.parse({
  palette: {
    background: '#ffffff',
    foreground: '#171717',
    accent: '#2563eb',
    muted: '#f5f5f5',
    border: '#e5e5e5',
    success: '#16a34a',
    warning: '#d97706',
    danger: '#dc2626',
  },
  darkPalette: {
    background: '#0a0a0a',
    foreground: '#fafafa',
    muted: '#171717',
    border: '#262626',
  },
  typography: {
    fontFamily: {
      heading: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      body: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      mono: "ui-monospace, 'Cascadia Code', monospace",
    },
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.25rem', xl: '1.75rem', '2xl': '2.5rem' },
    fontWeight: { normal: 400, medium: 500, bold: 700 },
    lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.7 },
  },
  space: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2.5rem', '2xl': '4rem' },
  radius: { sm: '0.25rem', md: '0.5rem', lg: '1rem', full: '9999px' },
  shadow: {
    sm: '0 1px 2px rgb(0 0 0 / 0.06)',
    md: '0 2px 8px rgb(0 0 0 / 0.10)',
    lg: '0 8px 24px rgb(0 0 0 / 0.14)',
  },
})

/**
 * Resolve tokens + mode into the runtime theme. Dark mode merges
 * `darkPalette` overrides over the base palette — tenants override only what
 * changes.
 */
export function buildTheme(tokens: ThemeTokens, mode: ThemeMode = 'light'): AtlasTheme {
  const color =
    mode === 'dark' && tokens.darkPalette ? mergeDefined(tokens.palette, tokens.darkPalette) : tokens.palette
  return {
    mode,
    color,
    typography: tokens.typography,
    space: tokens.space,
    radius: tokens.radius,
    shadow: tokens.shadow,
    variants: tokens.variants,
  }
}

/**
 * Validate unknown tenant tokens (defence in depth at the render boundary).
 * Invalid tokens degrade to the platform defaults — a bad theme row must never
 * take a site down.
 */
export function safeBuildTheme(
  tokens: unknown,
  mode: ThemeMode = 'light',
  onInvalid?: (detail: string) => void
): AtlasTheme {
  const parsed = themeTokensSchema.safeParse(tokens)
  if (!parsed.success) {
    onInvalid?.(parsed.error.message)
    return buildTheme(defaultTokens, mode)
  }
  return buildTheme(parsed.data, mode)
}

/**
 * Merge `overrides` onto `base`, skipping keys explicitly set to `undefined`.
 * Returns `T` (not `Partial<T>` + spread) so the result stays exactly
 * assignable to the base shape under `exactOptionalPropertyTypes` — a plain
 * `{ ...base, ...overrides }` spread would widen every overridden property to
 * include `| undefined` in its type even though the runtime value never is.
 */
function mergeDefined<T extends Record<string, unknown>>(base: T, overrides: { [K in keyof T]?: T[K] | undefined }): T {
  const out = { ...base }
  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined) {
      ;(out as Record<string, unknown>)[key] = value
    }
  }
  return out
}
