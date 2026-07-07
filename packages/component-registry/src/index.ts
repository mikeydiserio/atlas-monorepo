/**
 * @atlas/component-registry — Tier 2
 *
 * Central component registry (ADR-0005): discovery, schema-driven field
 * metadata (ADR-0006), prop validation, and version migrations. The editor
 * palette and the renderer both read from here; adding a component is
 * registration only — no switch statements, no hard-coded mappings anywhere.
 *
 * This package never imports @atlas/layout-engine (both Tier 2): apps wire the
 * two together by injecting `createComponentRenderer()` into `PageRenderer`.
 */
export const PACKAGE_NAME = '@atlas/component-registry' as const

export * from './types'
export * from './registry'
export * from './fields'
export * from './render'
export { cta, hero, image, registerBasicComponents, richText } from './components/basic'
