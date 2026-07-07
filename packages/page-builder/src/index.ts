/**
 * @atlas/page-builder — Tier 3
 *
 * The page editor core: pure tree operations, an editor reducer with undo/redo,
 * a registry-derived drop-zone model, the palette/inspector models, and
 * inline-edit bindings. Everything is headless and framework-free except the
 * thin React adapter in `react.ts` — the DnD/UI chrome in apps/dashboard is a
 * consumer of this model, never the owner of editing logic.
 */
export const PACKAGE_NAME = '@atlas/page-builder' as const

export * from './tree'
export * from './store'
export * from './dropzones'
export * from './palette'
export * from './react'
