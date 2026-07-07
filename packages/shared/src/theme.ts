import { z } from 'zod'

/**
 * Theme tokens — the per-tenant presentation contract (ADR-0006). Stored as the
 * JSONB `themes.tokens` column and provided to styled-components by
 * @atlas/theme-engine. Business logic never reads these; only presentation does.
 */

const hexColor = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, 'expected hex colour')

/** A colour scale (light → dark or brand ramp). Keys are free-form stops. */
const colorScale = z.record(z.string(), hexColor)

export const paletteSchema = z.object({
  background: hexColor,
  foreground: hexColor,
  /** Exactly one accent per view is the design rule; the palette may hold more. */
  accent: hexColor,
  muted: hexColor,
  border: hexColor,
  success: hexColor,
  warning: hexColor,
  danger: hexColor,
  /** Optional named scales, e.g. { brand: { 100: '#…', 500: '#…' } }. */
  scales: z.record(z.string(), colorScale).default({}),
})

export const typographySchema = z.object({
  fontFamily: z.object({
    heading: z.string(),
    body: z.string(),
    mono: z.string(),
  }),
  /** rem/px sizes keyed by scale step (xs, sm, md, lg, xl, …). */
  fontSize: z.record(z.string(), z.string()),
  fontWeight: z.record(z.string(), z.number().int()),
  lineHeight: z.record(z.string(), z.union([z.number(), z.string()])),
})

export const spacingSchema = z.record(z.string(), z.string())
export const radiusSchema = z.record(z.string(), z.string())
export const shadowSchema = z.record(z.string(), z.string())

export const themeTokensSchema = z.object({
  palette: paletteSchema,
  /** Optional dark-mode overrides; merged over `palette` when dark is active. */
  darkPalette: paletteSchema.partial().optional(),
  typography: typographySchema,
  space: spacingSchema,
  radius: radiusSchema,
  shadow: shadowSchema,
  /** Component-variant tokens, e.g. { button: { primary: {...} } }. */
  variants: z.record(z.string(), z.record(z.string(), z.unknown())).default({}),
})
export type ThemeTokens = z.infer<typeof themeTokensSchema>

export const themeSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  tokens: themeTokensSchema,
  isActive: z.boolean(),
})
export type Theme = z.infer<typeof themeSchema>
