import type { ComponentNode } from '@atlas/shared'
import type { ReactNode } from 'react'
import { getComponent } from './registry'
import type { ComponentDefinition } from './types'

/**
 * Component-node rendering: migration → validation → render. This produces the
 * ComponentRenderer that apps inject into the layout engine's PageRenderer —
 * the single point where the two registries meet, in the app layer, never in
 * each other.
 */

export interface ComponentRenderIssue {
  kind: 'unknown-component' | 'invalid-props' | 'missing-migration'
  nodeId: string
  componentId: string
  detail: string
}

export interface CreateRendererOptions {
  onIssue?: (issue: ComponentRenderIssue) => void
  /** Rendered in place of unknown components (editor shows a placeholder; the
   * public site renders nothing). */
  renderUnknown?: (node: ComponentNode) => ReactNode
}

/**
 * Upgrade instance props authored against an older schema version by running
 * stepwise migrations. Returns null when a step is missing (the instance can't
 * be safely interpreted — callers degrade to defaults and report).
 */
export function migrateProps(
  def: Pick<ComponentDefinition, 'version' | 'migrations'>,
  fromVersion: number,
  props: Record<string, unknown>
): Record<string, unknown> | null {
  if (fromVersion >= def.version) return props
  let current = props
  for (let v = fromVersion; v < def.version; v++) {
    const step = def.migrations?.[v]
    if (!step) return null
    current = step(current)
  }
  return current
}

/** Build the ComponentRenderer consumed by @atlas/layout-engine. */
export function createComponentRenderer(opts: CreateRendererOptions = {}) {
  return function renderComponentNode(node: ComponentNode): ReactNode {
    const def = getComponent(node.componentId)
    if (!def) {
      opts.onIssue?.({
        kind: 'unknown-component',
        nodeId: node.id,
        componentId: node.componentId,
        detail: `No component registered for '${node.componentId}'`,
      })
      return opts.renderUnknown ? opts.renderUnknown(node) : null
    }

    let props = migrateProps(def, node.version, node.props)
    if (props === null) {
      opts.onIssue?.({
        kind: 'missing-migration',
        nodeId: node.id,
        componentId: node.componentId,
        detail: `No migration path from v${node.version} to v${def.version}; defaults applied`,
      })
      props = def.defaultProps
    }

    // Defence in depth: instance props are re-validated on every render.
    // Invalid props degrade to defaults — a published page never crashes.
    const parsed = def.schema.safeParse({ ...def.defaultProps, ...props })
    if (!parsed.success) {
      opts.onIssue?.({
        kind: 'invalid-props',
        nodeId: node.id,
        componentId: node.componentId,
        detail: `Props failed validation against v${def.version} schema; defaults applied`,
      })
    }
    return def.render(parsed.success ? parsed.data : def.defaultProps)
  }
}
