import type { LayoutNode } from '@atlas/shared'
import { getLayout, resolveRegions, type RegionDefinition } from '@atlas/layout-engine'
import { findNode, isDescendant, isLayoutNode } from './tree'

/**
 * The drop-zone model (ADR-0005). Drop zones are GENERATED from layout registry
 * metadata — resolveRegions() + accepts + maxChildren — never hard-coded per
 * layout. A new layout gets correct drop zones by registration alone.
 */

export type DragItemKind = 'component' | 'layout'

export interface DragItem {
  kind: DragItemKind
  /** Set when dragging an existing node (move); absent for palette drags (add). */
  nodeId?: string
}

export interface DropZone {
  parentId: string
  regionId: string
  regionName: string
  accepts: RegionDefinition['accepts']
  /** Current child count vs the region's declared cap. */
  childCount: number
  maxChildren?: number
}

/** Enumerate every drop zone in the tree, in document order. */
export function collectDropZones(root: LayoutNode): DropZone[] {
  const zones: DropZone[] = []
  const visit = (node: LayoutNode) => {
    const def = getLayout(node.layoutId)
    if (def) {
      for (const region of resolveRegions(def, { ...def.defaultOptions, ...node.options })) {
        const children = node.regions[region.id] ?? []
        zones.push({
          parentId: node.id,
          regionId: region.id,
          regionName: region.name,
          accepts: region.accepts ?? 'any',
          childCount: children.length,
          ...(region.maxChildren !== undefined ? { maxChildren: region.maxChildren } : {}),
        })
      }
    }
    for (const children of Object.values(node.regions)) {
      for (const child of children) if (isLayoutNode(child)) visit(child)
    }
  }
  visit(root)
  return zones
}

export interface DropVerdict {
  allowed: boolean
  reason?: 'kind-not-accepted' | 'region-full' | 'own-descendant' | 'unknown-target'
}

/** Validate a drag item against one drop zone. Pure — usable by any DnD chrome. */
export function canDrop(root: LayoutNode, item: DragItem, zone: DropZone): DropVerdict {
  if (zone.accepts !== 'any' && zone.accepts !== `${item.kind}s`) {
    return { allowed: false, reason: 'kind-not-accepted' }
  }

  // Moving within the same region never increases the count; adding does.
  if (zone.maxChildren !== undefined) {
    const loc = item.nodeId ? findNode(root, item.nodeId) : null
    const alreadyHere = loc?.parent?.id === zone.parentId && loc?.regionId === zone.regionId
    if (!alreadyHere && zone.childCount >= zone.maxChildren) {
      return { allowed: false, reason: 'region-full' }
    }
  }

  // A layout can never be dropped into itself or its own subtree.
  if (item.kind === 'layout' && item.nodeId) {
    const loc = findNode(root, item.nodeId)
    if (loc && isLayoutNode(loc.node) && isDescendant(loc.node, zone.parentId)) {
      return { allowed: false, reason: 'own-descendant' }
    }
  }

  return { allowed: true }
}
