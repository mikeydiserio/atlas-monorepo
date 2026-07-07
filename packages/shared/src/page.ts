import { z } from 'zod'
import { pageMetadataSchema, seoSchema } from './seo'

/**
 * The page model (ADR-0004). A page is data: a tree of layout nodes and
 * component nodes. The renderer walks this tree and resolves each node against
 * the layout/component registries — it contains no node-specific branching.
 *
 * Stored as JSONB in `page_versions.definition` and validated here at every
 * boundary (write in the editor, read in the renderer as defence in depth).
 */

/** A placed component instance. `componentId` keys into the component registry. */
export const componentNodeSchema = z.object({
  /** Instance id, unique within the page. */
  id: z.string().min(1),
  /** Registry key, e.g. 'hero'. */
  componentId: z.string().min(1),
  /** Schema version this instance was authored against (component evolution). */
  version: z.number().int().nonnegative(),
  /** Props, validated against the component's own schema by the registry. */
  props: z.record(z.string(), z.unknown()).default({}),
})
export type ComponentNode = z.infer<typeof componentNodeSchema>

/**
 * A placed layout instance. Regions are keyed by the layout's declared region
 * ids; each region holds an ordered list of children. Children may be
 * components *or* nested layouts — this is how Grid/Tabs/Accordion/Carousel
 * layouts compose (docs/atlas §5).
 */
export interface LayoutNode {
  id: string
  layoutId: string
  options: Record<string, unknown>
  regions: Record<string, RegionChild[]>
}

export type RegionChild = ComponentNode | LayoutNode

// Recursive schemas via z.lazy. The callbacks defer resolution to parse time, so
// the forward reference between the two consts is safe.
export const layoutNodeSchema: z.ZodType<LayoutNode> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    layoutId: z.string().min(1),
    options: z.record(z.string(), z.unknown()).default({}),
    regions: z.record(z.string(), z.array(regionChildSchema)),
  })
)

export const regionChildSchema: z.ZodType<RegionChild> = z.lazy(() =>
  // component-first: a component node lacks `layoutId`, a layout node lacks
  // `componentId`, so the union is unambiguous.
  z.union([componentNodeSchema, layoutNodeSchema])
)

export const pageStatusSchema = z.enum(['draft', 'published', 'scheduled', 'archived'])
export type PageStatus = z.infer<typeof pageStatusSchema>

export const pageDefinitionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  slug: z.string().min(1),
  status: pageStatusSchema,
  version: z.number().int().nonnegative(),
  metadata: pageMetadataSchema,
  seo: seoSchema,
  /** The root of the layout tree. */
  layout: layoutNodeSchema,
  publishedAt: z.string().datetime().nullish(),
  scheduledFor: z.string().datetime().nullish(),
})
export type PageDefinition = z.infer<typeof pageDefinitionSchema>

/** Walk every component node in a page tree (renderer + validation helper). */
export function* walkComponents(node: LayoutNode): Generator<ComponentNode> {
  for (const children of Object.values(node.regions)) {
    for (const child of children) {
      if ('componentId' in child) {
        yield child
      } else {
        yield* walkComponents(child)
      }
    }
  }
}
