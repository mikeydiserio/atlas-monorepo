import type { ComponentNode, LayoutNode, PageDefinition } from '@atlas/shared'
import { Fragment, type ReactNode } from 'react'
import { getLayout } from './registry'
import { resolveRegions } from './types'

/**
 * The tree renderer (ADR-0004/0005). Walks Page → Layouts → Regions → Components
 * and resolves every node against the layout registry. It contains ZERO
 * layout-specific or component-specific branching.
 *
 * Component rendering is injected: the layout engine never imports the component
 * registry (both are Tier 2), and layouts never learn what components are.
 */

export type ComponentRenderer = (node: ComponentNode) => ReactNode

export interface RenderIssue {
  kind: 'unknown-layout' | 'undeclared-region' | 'invalid-options'
  nodeId: string
  detail: string
}

export interface RenderTreeOptions {
  renderComponent: ComponentRenderer
  /** Collects non-fatal problems (unknown layout, dropped region content…). */
  onIssue?: ((issue: RenderIssue) => void) | undefined
}

export function renderLayoutNode(node: LayoutNode, opts: RenderTreeOptions): ReactNode {
  const layout = getLayout(node.layoutId)
  if (!layout) {
    opts.onIssue?.({
      kind: 'unknown-layout',
      nodeId: node.id,
      detail: `No layout registered for '${node.layoutId}'`,
    })
    return null
  }

  // Defence in depth: instance options are re-validated against the layout's
  // schema on every render. Invalid options degrade to defaults, never crash a
  // published page.
  const parsed = layout.optionsSchema.safeParse({ ...layout.defaultOptions, ...node.options })
  const options = parsed.success ? parsed.data : layout.defaultOptions
  if (!parsed.success) {
    opts.onIssue?.({
      kind: 'invalid-options',
      nodeId: node.id,
      detail: `Options for '${node.layoutId}' failed validation; defaults applied`,
    })
  }

  const regionDefs = resolveRegions(layout, options)
  const regions: Record<string, ReactNode> = {}
  for (const def of regionDefs) {
    const children = node.regions[def.id] ?? []
    regions[def.id] = children.map((child) =>
      'componentId' in child ? (
        <Fragment key={child.id}>{opts.renderComponent(child)}</Fragment>
      ) : (
        <Fragment key={child.id}>{renderLayoutNode(child, opts)}</Fragment>
      )
    )
  }

  // Content authored into a region this layout doesn't declare would silently
  // vanish — surface it instead.
  for (const [key, children] of Object.entries(node.regions)) {
    if (children.length > 0 && !regionDefs.some((d) => d.id === key)) {
      opts.onIssue?.({
        kind: 'undeclared-region',
        nodeId: node.id,
        detail: `Region '${key}' is not declared by layout '${node.layoutId}'; its content was not rendered`,
      })
    }
  }

  return (
    <Fragment key={node.id}>
      {layout.render({ options, regions, responsive: layout.responsive })}
    </Fragment>
  )
}

export interface PageRendererProps extends RenderTreeOptions {
  definition: PageDefinition
}

/** Render a full page definition. Medium-agnostic apart from React itself. */
export function PageRenderer({ definition, renderComponent, onIssue }: PageRendererProps) {
  return <>{renderLayoutNode(definition.layout, { renderComponent, onIssue })}</>
}
