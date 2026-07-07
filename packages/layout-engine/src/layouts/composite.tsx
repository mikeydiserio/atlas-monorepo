import type { CSSProperties } from 'react'
import { z } from 'zod'
import { defineLayout, type RegionDefinition } from '../types'

/**
 * Composite layouts: grid, tabs, accordion, carousel.
 *
 * Tabs and Accordion demonstrate DYNAMIC REGIONS: their regions derive from the
 * authored items via getRegions(options), so the editor still auto-generates one
 * drop zone per tab/section with no tab-specific editor code (ADR-0005).
 *
 * These render static, semantic structure only. Interactive behaviour (tab
 * switching, accordion collapse) is progressive enhancement applied by the UI
 * layer in Stage 7 — a page renders meaningful content with zero JS.
 */

const itemSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'item id must be lowercase alphanumeric/hyphen'),
  label: z.string().min(1),
})

// ---------------------------------------------------------------------------
// Grid — one region; each child occupies a cell.
// ---------------------------------------------------------------------------
const gridOptionsSchema = z.object({
  columns: z.number().int().min(1).max(6).default(3),
  gap: z.string().default('1.5rem'),
})
type GridOptions = z.infer<typeof gridOptionsSchema>

export const grid = defineLayout<GridOptions>({
  id: 'grid',
  name: 'Grid',
  icon: 'layout-grid',
  regions: [{ id: 'cells', name: 'Cells', accepts: 'any' }],
  optionsSchema: gridOptionsSchema,
  defaultOptions: { columns: 3, gap: '1.5rem' },
  responsive: { stackBelow: 'sm', previewWidths: [375, 768, 1280] },
  editing: { description: 'Uniform grid; every child is a cell.', allowNesting: true, category: 'composite' },
  render: ({ options, regions }) => (
    <div
      data-atlas-layout="grid"
      data-atlas-stack="sm"
      style={
        {
          '--atlas-cols': `repeat(${options.columns}, 1fr)`,
          '--atlas-gap': options.gap,
        } as CSSProperties
      }
    >
      {/* display:contents so each cell child is a direct grid item */}
      <div data-atlas-region="cells" style={{ display: 'contents' }}>
        {regions.cells}
      </div>
    </div>
  ),
})

// ---------------------------------------------------------------------------
// Tabs — dynamic regions: one per authored tab.
// ---------------------------------------------------------------------------
const tabsOptionsSchema = z.object({
  items: z.array(itemSchema).min(1).default([{ id: 'tab-1', label: 'Tab 1' }]),
})
type TabsOptions = z.infer<typeof tabsOptionsSchema>

function itemRegions(items: TabsOptions['items'], prefix: string): RegionDefinition[] {
  return items.map((item) => ({ id: `${prefix}:${item.id}`, name: item.label, accepts: 'any' as const }))
}

export const tabs = defineLayout<TabsOptions>({
  id: 'tabs',
  name: 'Tabs',
  icon: 'app-window',
  regions: [],
  getRegions: (options) => itemRegions(options.items, 'tab'),
  optionsSchema: tabsOptionsSchema,
  defaultOptions: { items: [{ id: 'tab-1', label: 'Tab 1' }] },
  responsive: { previewWidths: [375, 1280] },
  editing: { description: 'One drop zone per tab; panels toggle client-side.', allowNesting: true, category: 'composite' },
  render: ({ options, regions }) => (
    <div data-atlas-layout="tabs">
      <div role="tablist" data-atlas-tablist="">
        {options.items.map((item, i) => (
          <button key={item.id} type="button" role="tab" data-atlas-tab={item.id} aria-selected={i === 0}>
            {item.label}
          </button>
        ))}
      </div>
      {options.items.map((item, i) => (
        <section key={item.id} role="tabpanel" data-atlas-tabpanel={item.id} hidden={i !== 0}>
          <div data-atlas-region={`tab:${item.id}`}>{regions[`tab:${item.id}`]}</div>
        </section>
      ))}
    </div>
  ),
})

// ---------------------------------------------------------------------------
// Accordion — dynamic regions: one per section. Native details/summary, so it
// is fully functional with zero JS.
// ---------------------------------------------------------------------------
const accordionOptionsSchema = z.object({
  items: z.array(itemSchema).min(1).default([{ id: 'section-1', label: 'Section 1' }]),
  /** Index of the section open by default; -1 = all closed. */
  defaultOpen: z.number().int().default(0),
})
type AccordionOptions = z.infer<typeof accordionOptionsSchema>

export const accordionLayout = defineLayout<AccordionOptions>({
  id: 'accordion-layout',
  name: 'Accordion Layout',
  icon: 'list-collapse',
  regions: [],
  getRegions: (options) => itemRegions(options.items, 'section'),
  optionsSchema: accordionOptionsSchema,
  defaultOptions: { items: [{ id: 'section-1', label: 'Section 1' }], defaultOpen: 0 },
  responsive: { previewWidths: [375, 1280] },
  editing: { description: 'Collapsible sections; one drop zone per section.', allowNesting: true, category: 'composite' },
  render: ({ options, regions }) => (
    <div data-atlas-layout="accordion-layout">
      {options.items.map((item, i) => (
        <details key={item.id} data-atlas-accordion-item={item.id} open={i === options.defaultOpen}>
          <summary>{item.label}</summary>
          <div data-atlas-region={`section:${item.id}`}>{regions[`section:${item.id}`]}</div>
        </details>
      ))}
    </div>
  ),
})

// ---------------------------------------------------------------------------
// Carousel — one region; each child is a scroll-snap slide (CSS-only).
// ---------------------------------------------------------------------------
const carouselOptionsSchema = z.object({
  /** CSS length for each slide track (e.g. '80%', '320px'). */
  slideSize: z.string().default('80%'),
  gap: z.string().default('1.5rem'),
})
type CarouselOptions = z.infer<typeof carouselOptionsSchema>

export const carousel = defineLayout<CarouselOptions>({
  id: 'carousel',
  name: 'Carousel Layout',
  icon: 'gallery-horizontal',
  regions: [{ id: 'slides', name: 'Slides', accepts: 'any' }],
  optionsSchema: carouselOptionsSchema,
  defaultOptions: { slideSize: '80%', gap: '1.5rem' },
  responsive: { previewWidths: [375, 1280] },
  editing: { description: 'Horizontal scroll-snap track; every child is a slide.', allowNesting: true, category: 'composite' },
  render: ({ options, regions }) => (
    <div
      data-atlas-layout="carousel"
      style={{ '--atlas-slide': options.slideSize, '--atlas-gap': options.gap } as CSSProperties}
    >
      <div data-atlas-region="slides">{regions.slides}</div>
    </div>
  ),
})
