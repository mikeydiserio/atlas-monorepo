import {
  deriveEditableFields,
  getComponent,
  listComponents,
  type EditableFieldSpec,
} from '@atlas/component-registry'
import { listLayouts } from '@atlas/layout-engine'
import { findNode, isLayoutNode } from './tree'
import type { LayoutNode } from '@atlas/shared'

/**
 * Palette + inspector models, derived entirely from the registries. The editor
 * UI renders these; it never enumerates components or layouts itself.
 */

export interface PaletteEntry {
  kind: 'component' | 'layout'
  id: string
  name: string
  icon: string
  category: string
  description?: string
}

export interface PaletteGroup {
  category: string
  entries: PaletteEntry[]
}

export function buildPalette(): PaletteGroup[] {
  const entries: PaletteEntry[] = [
    ...listComponents().map((c) => ({
      kind: 'component' as const,
      id: c.id,
      name: c.name,
      icon: c.icon,
      category: c.category,
      ...(c.description ? { description: c.description } : {}),
    })),
    ...listLayouts().map((l) => ({
      kind: 'layout' as const,
      id: l.id,
      name: l.name,
      icon: l.icon,
      category: `layout:${l.editing.category ?? 'other'}`,
      ...(l.editing.description ? { description: l.editing.description } : {}),
    })),
  ]
  const groups = new Map<string, PaletteEntry[]>()
  for (const entry of entries) {
    const list = groups.get(entry.category) ?? []
    list.push(entry)
    groups.set(entry.category, list)
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, list]) => ({ category, entries: list }))
}

/**
 * Inline-edit bindings for a component node: the fields flagged
 * `inline: true` in its (schema-derived) editable-field specs, paired with
 * their current values. The editor overlays contenteditable regions on the
 * rendered output using these bindings (Sitecore-style on-page editing).
 */
export interface InlineBinding {
  nodeId: string
  field: EditableFieldSpec
  value: unknown
}

export function inlineBindingsFor(root: LayoutNode, nodeId: string): InlineBinding[] {
  const loc = findNode(root, nodeId)
  if (!loc || isLayoutNode(loc.node)) return []
  const def = getComponent(loc.node.componentId)
  if (!def) return []
  const props = loc.node.props
  return deriveEditableFields(def)
    .filter((field) => field.inline)
    .map((field) => ({ nodeId, field, value: props[field.name] }))
}
