import type { CSSProperties, ReactNode } from 'react'
import { z } from 'zod'
import { defineLayout, type LayoutDefinition, type RegionDefinition } from '../types'

/**
 * Column layouts — structure only. Every layout here renders a grid container
 * with one wrapper per region carrying data-atlas-region (the editor derives
 * its drop zones from these attributes + the registry metadata, never from
 * layout-specific logic).
 */

const columnOptionsSchema = z.object({
  /** Gap between regions (CSS length). Structural, not themed. */
  gap: z.string().default('1.5rem'),
})
type ColumnOptions = z.infer<typeof columnOptionsSchema>

function region(id: string, name: string, extra?: Partial<RegionDefinition>): RegionDefinition {
  return { id, name, accepts: 'any', ...extra }
}

function gridStyle(cols: string, gap: string): CSSProperties {
  return { '--atlas-cols': cols, '--atlas-gap': gap } as CSSProperties
}

/** Shared render for fixed-column layouts. */
function renderColumns(
  id: string,
  cols: string,
  stack: 'sm' | 'md' | 'lg' | undefined,
  options: ColumnOptions,
  regionIds: string[],
  regions: Record<string, ReactNode>
): ReactNode {
  return (
    <div data-atlas-layout={id} data-atlas-stack={stack} style={gridStyle(cols, options.gap)}>
      {regionIds.map((rid) => (
        <div key={rid} data-atlas-region={rid}>
          {regions[rid]}
        </div>
      ))}
    </div>
  )
}

function makeColumnsLayout(config: {
  id: string
  name: string
  icon: string
  cols: string
  regions: RegionDefinition[]
  stackBelow?: 'sm' | 'md' | 'lg'
  description: string
}): LayoutDefinition<ColumnOptions> {
  return defineLayout<ColumnOptions>({
    id: config.id,
    name: config.name,
    icon: config.icon,
    regions: config.regions,
    optionsSchema: columnOptionsSchema,
    defaultOptions: { gap: '1.5rem' },
    responsive: { stackBelow: config.stackBelow, previewWidths: [375, 768, 1280] },
    editing: { description: config.description, allowNesting: true, category: 'columns' },
    render: ({ options, regions }) =>
      renderColumns(
        config.id,
        config.cols,
        config.stackBelow,
        options,
        config.regions.map((r) => r.id),
        regions
      ),
  })
}

export const singleColumn = makeColumnsLayout({
  id: 'single-column',
  name: 'Single Column',
  icon: 'rectangle-vertical',
  cols: '1fr',
  regions: [region('main', 'Main')],
  description: 'One full-width region.',
})

export const twoColumn5050 = makeColumnsLayout({
  id: 'two-column-50-50',
  name: 'Two Column (50/50)',
  icon: 'columns-2',
  cols: '1fr 1fr',
  regions: [region('left', 'Left'), region('right', 'Right')],
  stackBelow: 'md',
  description: 'Two equal columns.',
})

export const twoColumn3070 = makeColumnsLayout({
  id: 'two-column-30-70',
  name: 'Two Column (30/70)',
  icon: 'panel-left',
  cols: '3fr 7fr',
  regions: [region('left', 'Left (30%)'), region('right', 'Right (70%)')],
  stackBelow: 'md',
  description: 'Narrow left, wide right.',
})

export const twoColumn7030 = makeColumnsLayout({
  id: 'two-column-70-30',
  name: 'Two Column (70/30)',
  icon: 'panel-right',
  cols: '7fr 3fr',
  regions: [region('left', 'Left (70%)'), region('right', 'Right (30%)')],
  stackBelow: 'md',
  description: 'Wide left, narrow right.',
})

export const threeColumn = makeColumnsLayout({
  id: 'three-column',
  name: 'Three Columns',
  icon: 'columns-3',
  cols: '1fr 1fr 1fr',
  regions: [region('left', 'Left'), region('center', 'Center'), region('right', 'Right')],
  stackBelow: 'md',
  description: 'Three equal columns.',
})

export const fourColumn = makeColumnsLayout({
  id: 'four-column',
  name: 'Four Columns',
  icon: 'columns-4',
  cols: '1fr 1fr 1fr 1fr',
  regions: [
    region('col-1', 'Column 1'),
    region('col-2', 'Column 2'),
    region('col-3', 'Column 3'),
    region('col-4', 'Column 4'),
  ],
  stackBelow: 'lg',
  description: 'Four equal columns.',
})

/** Sidebar — the side and width are options, so it gets its own definition. */
const sidebarOptionsSchema = z.object({
  gap: z.string().default('2rem'),
  side: z.enum(['left', 'right']).default('left'),
  /** CSS length for the sidebar track. */
  sidebarWidth: z.string().default('280px'),
})
type SidebarOptions = z.infer<typeof sidebarOptionsSchema>

export const sidebar = defineLayout<SidebarOptions>({
  id: 'sidebar',
  name: 'Sidebar',
  icon: 'panel-left-open',
  regions: [region('sidebar', 'Sidebar'), region('content', 'Content')],
  optionsSchema: sidebarOptionsSchema,
  defaultOptions: { gap: '2rem', side: 'left', sidebarWidth: '280px' },
  responsive: { stackBelow: 'md', previewWidths: [375, 1280] },
  editing: { description: 'Fixed sidebar next to fluid content.', allowNesting: true, category: 'columns' },
  render: ({ options, regions }) => {
    const cols =
      options.side === 'left' ? `${options.sidebarWidth} 1fr` : `1fr ${options.sidebarWidth}`
    const order: Array<'sidebar' | 'content'> =
      options.side === 'left' ? ['sidebar', 'content'] : ['content', 'sidebar']
    return (
      <div data-atlas-layout="sidebar" data-atlas-stack="md" style={gridStyle(cols, options.gap)}>
        {order.map((rid) => (
          <div key={rid} data-atlas-region={rid}>
            {regions[rid]}
          </div>
        ))}
      </div>
    )
  },
})

/** Hero — a single-component banner region stacked above content. */
const heroOptionsSchema = z.object({
  gap: z.string().default('0px'),
})
type HeroOptions = z.infer<typeof heroOptionsSchema>

export const heroLayout = defineLayout<HeroOptions>({
  id: 'hero-layout',
  name: 'Hero Layout',
  icon: 'layout-template',
  regions: [
    region('hero', 'Hero', { maxChildren: 1 }),
    region('content', 'Content'),
  ],
  optionsSchema: heroOptionsSchema,
  defaultOptions: { gap: '0px' },
  responsive: { previewWidths: [375, 1280] },
  editing: { description: 'Full-width hero above the page content.', allowNesting: true, category: 'composite' },
  render: ({ options, regions }) => (
    <div data-atlas-layout="hero-layout" style={gridStyle('1fr', options.gap)}>
      <div data-atlas-region="hero">{regions.hero}</div>
      <div data-atlas-region="content">{regions.content}</div>
    </div>
  ),
})
