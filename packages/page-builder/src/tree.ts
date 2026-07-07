import type { ComponentNode, LayoutNode, RegionChild } from '@atlas/shared'

/**
 * Pure, immutable operations on the LayoutNode tree. Every operation returns a
 * new tree (structural sharing on untouched branches) — this is what makes
 * undo/redo trivial snapshots and keeps the editor state model testable with
 * zero React involvement.
 */

export function isLayoutNode(child: RegionChild): child is LayoutNode {
  return 'layoutId' in child
}

export interface NodeLocation {
  node: RegionChild
  /** null when `node` is the root layout. */
  parent: LayoutNode | null
  regionId: string | null
  index: number
}

/** Locate a node (layout or component) anywhere in the tree by instance id. */
export function findNode(root: LayoutNode, id: string): NodeLocation | null {
  if (root.id === id) return { node: root, parent: null, regionId: null, index: 0 }
  for (const [regionId, children] of Object.entries(root.regions)) {
    for (let index = 0; index < children.length; index++) {
      const child = children[index] as RegionChild
      if (child.id === id) return { node: child, parent: root, regionId, index }
      if (isLayoutNode(child)) {
        const found = findNode(child, id)
        if (found) return found
      }
    }
  }
  return null
}

/** True when `candidateId` is `ancestor` itself or anywhere below it. */
export function isDescendant(ancestor: LayoutNode, candidateId: string): boolean {
  return findNode(ancestor, candidateId) !== null
}

/** Immutably replace the children array of one region on one layout node. */
function withRegion(node: LayoutNode, regionId: string, children: RegionChild[]): LayoutNode {
  return { ...node, regions: { ...node.regions, [regionId]: children } }
}

/** Immutably rebuild the path to `targetLayoutId` applying `transform` to it. */
function mapLayout(
  node: LayoutNode,
  targetLayoutId: string,
  transform: (layout: LayoutNode) => LayoutNode
): LayoutNode {
  if (node.id === targetLayoutId) return transform(node)
  let changed = false
  const regions: Record<string, RegionChild[]> = {}
  for (const [regionId, children] of Object.entries(node.regions)) {
    const next = children.map((child) => {
      if (!isLayoutNode(child)) return child
      const mapped = mapLayout(child, targetLayoutId, transform)
      if (mapped !== child) changed = true
      return mapped
    })
    regions[regionId] = next
  }
  return changed ? { ...node, regions } : node
}

export interface InsertTarget {
  parentId: string
  regionId: string
  /** Insert position; appends when omitted or out of range. */
  index?: number
}

/** Insert a child into a region. Throws when the parent layout doesn't exist. */
export function insertChild(root: LayoutNode, target: InsertTarget, child: RegionChild): LayoutNode {
  const parent = findNode(root, target.parentId)
  if (!parent || !isLayoutNode(parent.node)) {
    throw new Error(`insertChild: no layout node '${target.parentId}' in tree`)
  }
  return mapLayout(root, target.parentId, (layout) => {
    const children = [...(layout.regions[target.regionId] ?? [])]
    const at =
      target.index === undefined || target.index < 0 || target.index > children.length
        ? children.length
        : target.index
    children.splice(at, 0, child)
    return withRegion(layout, target.regionId, children)
  })
}

export interface RemoveResult {
  root: LayoutNode
  removed: RegionChild
}

/** Remove a node. The root layout cannot be removed. */
export function removeNode(root: LayoutNode, id: string): RemoveResult {
  const loc = findNode(root, id)
  if (!loc) throw new Error(`removeNode: no node '${id}' in tree`)
  if (!loc.parent || loc.regionId === null) throw new Error('removeNode: cannot remove the root layout')
  const { parent, regionId } = loc
  const next = mapLayout(root, parent.id, (layout) =>
    withRegion(layout, regionId, (layout.regions[regionId] ?? []).filter((c) => c.id !== id))
  )
  return { root: next, removed: loc.node }
}

/**
 * Move a node to a new location. Guards against moving a layout into itself or
 * its own descendants (which would detach the subtree into nowhere).
 */
export function moveNode(root: LayoutNode, id: string, target: InsertTarget): LayoutNode {
  const loc = findNode(root, id)
  if (!loc) throw new Error(`moveNode: no node '${id}' in tree`)
  if (isLayoutNode(loc.node) && isDescendant(loc.node, target.parentId)) {
    throw new Error('moveNode: cannot move a layout into itself or its own descendant')
  }

  // Same-region reorder needs its index adjusted after removal shifts positions.
  let index = target.index
  if (
    loc.parent?.id === target.parentId &&
    loc.regionId === target.regionId &&
    index !== undefined &&
    index > loc.index
  ) {
    index -= 1
  }

  const { root: without, removed } = removeNode(root, id)
  return insertChild(without, { ...target, ...(index !== undefined ? { index } : {}) }, removed)
}

/** Deep-clone a subtree with fresh instance ids. */
export function cloneWithNewIds(node: RegionChild, newId: () => string): RegionChild {
  if (!isLayoutNode(node)) return { ...node, id: newId(), props: { ...node.props } }
  const regions: Record<string, RegionChild[]> = {}
  for (const [regionId, children] of Object.entries(node.regions)) {
    regions[regionId] = children.map((c) => cloneWithNewIds(c, newId))
  }
  return { ...node, id: newId(), options: { ...node.options }, regions }
}

/** Duplicate a node in place (inserted immediately after the original). */
export function duplicateNode(root: LayoutNode, id: string, newId: () => string): { root: LayoutNode; copy: RegionChild } {
  const loc = findNode(root, id)
  if (!loc || !loc.parent || loc.regionId === null) {
    throw new Error(`duplicateNode: no removable node '${id}' in tree`)
  }
  const copy = cloneWithNewIds(loc.node, newId)
  const root2 = insertChild(root, { parentId: loc.parent.id, regionId: loc.regionId, index: loc.index + 1 }, copy)
  return { root: root2, copy }
}

/** Merge a partial props patch into a component node. */
export function updateComponentProps(
  root: LayoutNode,
  id: string,
  patch: Record<string, unknown>
): LayoutNode {
  const loc = findNode(root, id)
  if (!loc || isLayoutNode(loc.node)) throw new Error(`updateComponentProps: no component '${id}' in tree`)
  if (!loc.parent || loc.regionId === null) throw new Error('updateComponentProps: component has no parent')
  const { parent, regionId } = loc
  return mapLayout(root, parent.id, (layout) =>
    withRegion(
      layout,
      regionId,
      (layout.regions[regionId] ?? []).map((c) =>
        c.id === id && !isLayoutNode(c)
          ? ({ ...c, props: { ...c.props, ...patch } } satisfies ComponentNode)
          : c
      )
    )
  )
}

/** Merge a partial options patch into a layout node (root included). */
export function updateLayoutOptions(
  root: LayoutNode,
  id: string,
  patch: Record<string, unknown>
): LayoutNode {
  const loc = findNode(root, id)
  if (!loc || !isLayoutNode(loc.node)) throw new Error(`updateLayoutOptions: no layout '${id}' in tree`)
  return mapLayout(root, id, (layout) => ({ ...layout, options: { ...layout.options, ...patch } }))
}
