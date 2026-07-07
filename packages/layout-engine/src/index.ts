/**
 * @atlas/layout-engine — Tier 2
 *
 * Layout registry + the Page → Layouts → Regions → Components tree renderer
 * (ADR-0005). Adding a layout is registration only: the renderer and the editor
 * discover regions, options, and responsive behaviour from the definition.
 *
 * Consumers import `structural.css` once for responsive stacking rules —
 * structure only, no theme values.
 */
export const PACKAGE_NAME = '@atlas/layout-engine' as const

export * from './types'
export * from './registry'
export * from './renderer'

import {
  fourColumn,
  heroLayout,
  sidebar,
  singleColumn,
  threeColumn,
  twoColumn3070,
  twoColumn5050,
  twoColumn7030,
} from './layouts/columns'
import { accordionLayout, carousel, grid, tabs } from './layouts/composite'
import { hasLayout, registerLayout } from './registry'

export {
  singleColumn,
  twoColumn5050,
  twoColumn3070,
  twoColumn7030,
  threeColumn,
  fourColumn,
  sidebar,
  heroLayout,
  grid,
  tabs,
  accordionLayout,
  carousel,
}

const BUILT_IN = [
  singleColumn,
  twoColumn5050,
  twoColumn3070,
  twoColumn7030,
  threeColumn,
  fourColumn,
  sidebar,
  heroLayout,
  grid,
  tabs,
  accordionLayout,
  carousel,
] as const

/**
 * Register the built-in catalog. Idempotent so app roots and the editor can
 * both call it without coordinating.
 */
export function registerBuiltInLayouts(): void {
  for (const layout of BUILT_IN) {
    if (!hasLayout(layout.id)) registerLayout(layout)
  }
}
