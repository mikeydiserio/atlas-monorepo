/**
 * @atlas/ui — Tier 2
 *
 * Presentational component library. Every value comes from the AtlasTheme via
 * @atlas/theme-engine — no hard-coded presentation. No business logic, ever.
 * The starter's richer component set (accordion, select, toast, …) is adopted
 * per-need by re-exporting through this package so consumers keep one import
 * surface.
 */
export const PACKAGE_NAME = '@atlas/ui' as const

export * from './primitives'
export type { ButtonVariant } from './primitives.styles'
