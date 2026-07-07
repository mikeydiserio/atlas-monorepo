import type { ReactNode } from 'react'
import type { z } from 'zod'

/**
 * Layout contracts (ADR-0005). A layout defines page STRUCTURE only: which
 * regions exist and how they are arranged. It knows nothing about component
 * implementations — regions receive already-rendered children.
 */

/** What a region will accept. The editor enforces this in its drop logic. */
export type RegionAccepts = 'components' | 'layouts' | 'any'

export interface RegionDefinition {
  /** Region key used in LayoutNode.regions, e.g. 'left'. */
  id: string
  /** Human label shown on the editor's drop zone. */
  name: string
  accepts?: RegionAccepts
  /** Optional cap on children (e.g. a hero region that takes one component). */
  maxChildren?: number
}

/** Responsive behaviour metadata — consumed by layouts and the editor preview. */
export interface ResponsiveBehaviour {
  /** Viewport below which multi-column layouts stack vertically. */
  stackBelow?: 'sm' | 'md' | 'lg' | undefined
  /** Editor hint: which preview widths are most meaningful for this layout. */
  previewWidths?: number[]
}

/** Editor-facing metadata. The editor renders drop zones from this — never from
 * hard-coded per-layout logic. */
export interface LayoutEditingMetadata {
  /** Palette description. */
  description?: string
  /** Whether regions of this layout may contain nested layouts. */
  allowNesting?: boolean
  /** Palette grouping, e.g. 'columns' | 'composite'. */
  category?: string
}

/** Props passed to a layout's render function. */
export interface LayoutRenderProps<TOptions> {
  options: TOptions
  /** Rendered children per region id — opaque to the layout. */
  regions: Record<string, ReactNode>
  responsive: ResponsiveBehaviour
}

export interface LayoutDefinition<TOptions = Record<string, unknown>> {
  /** Registry key, e.g. 'two-column-70-30'. Stable forever once published. */
  id: string
  name: string
  /** Icon name (lucide key) for the editor palette. */
  icon: string
  /** Statically declared regions. */
  regions: RegionDefinition[]
  /**
   * Dynamic regions derived from options (tabs, accordion, carousel). When
   * present, the editor and renderer use this instead of `regions`.
   */
  getRegions?: (options: TOptions) => RegionDefinition[]
  /** Configurable options, validated everywhere via this schema. */
  optionsSchema: z.ZodType<TOptions>
  defaultOptions: TOptions
  responsive: ResponsiveBehaviour
  editing: LayoutEditingMetadata
  /** Structure-only render. Receives pre-rendered region children. */
  render: (props: LayoutRenderProps<TOptions>) => ReactNode
}

/** Resolve the effective regions for a layout instance. */
export function resolveRegions<TOptions>(
  layout: LayoutDefinition<TOptions>,
  options: TOptions
): RegionDefinition[] {
  return layout.getRegions ? layout.getRegions(options) : layout.regions
}

/** Identity helper so layout modules get full inference without casts. */
export function defineLayout<TOptions>(def: LayoutDefinition<TOptions>): LayoutDefinition<TOptions> {
  return def
}
