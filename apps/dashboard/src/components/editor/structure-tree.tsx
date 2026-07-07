'use client'

import type { LayoutNode, RegionChild } from '@atlas/shared'
import { getLayout, resolveRegions } from '@atlas/layout-engine'
import { canDrop, isLayoutNode, type DragItem, type DropZone } from '@atlas/page-builder'
import { useState, type DragEvent } from 'react'
import { TreeNode, TreeRegion } from './editor.styles'

/**
 * Structure panel: the layout tree with regions as drop targets. Drop zones
 * come from resolveRegions() — registry metadata, never per-layout logic.
 * HTML5 drag: palette items carry {kind,id}; existing nodes carry {nodeId}.
 */

export interface TreeDropEvent {
  item: DragItem & { paletteId?: string }
  target: { parentId: string; regionId: string; index?: number }
}

interface StructureTreeProps {
  root: LayoutNode
  selectedId: string | null
  onSelect: (id: string) => void
  onDrop: (event: TreeDropEvent) => void
}

const DRAG_MIME = 'application/x-atlas-drag'

export function readDragItem(e: DragEvent): (DragItem & { paletteId?: string }) | null {
  try {
    const raw = e.dataTransfer.getData(DRAG_MIME)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeDragItem(e: DragEvent, item: DragItem & { paletteId?: string }): void {
  e.dataTransfer.setData(DRAG_MIME, JSON.stringify(item))
  e.dataTransfer.effectAllowed = 'move'
}

function zoneFor(node: LayoutNode, regionId: string, regionName: string): DropZone {
  const def = getLayout(node.layoutId)
  const region = def
    ? resolveRegions(def, { ...def.defaultOptions, ...node.options }).find((r) => r.id === regionId)
    : undefined
  return {
    parentId: node.id,
    regionId,
    regionName,
    accepts: region?.accepts ?? 'any',
    childCount: (node.regions[regionId] ?? []).length,
    ...(region?.maxChildren !== undefined ? { maxChildren: region.maxChildren } : {}),
  }
}

function RegionTarget({
  root,
  node,
  regionId,
  regionName,
  children,
  onDrop,
}: {
  root: LayoutNode
  node: LayoutNode
  regionId: string
  regionName: string
  children: React.ReactNode
  onDrop: StructureTreeProps['onDrop']
}) {
  const [hover, setHover] = useState<'ok' | 'blocked' | null>(null)

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    // dataTransfer payloads are hidden during dragover in some browsers; show
    // optimistic hover and validate authoritatively on drop.
    setHover('ok')
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setHover(null)
    const item = readDragItem(e)
    if (!item) return
    const verdict = canDrop(root, item, zoneFor(node, regionId, regionName))
    if (!verdict.allowed) {
      setHover('blocked')
      setTimeout(() => setHover(null), 600)
      return
    }
    onDrop({ item, target: { parentId: node.id, regionId } })
  }

  return (
    <TreeRegion
      $active={hover === 'ok'}
      $blocked={hover === 'blocked'}
      onDragOver={handleDragOver}
      onDragLeave={() => setHover(null)}
      onDrop={handleDrop}
      data-testid={`zone-${node.id}-${regionId}`}
    >
      <strong>{regionName}</strong>
      {children}
    </TreeRegion>
  )
}

function ChildRow({
  child,
  selectedId,
  onSelect,
  root,
  onDrop,
}: {
  child: RegionChild
  selectedId: string | null
  onSelect: (id: string) => void
  root: LayoutNode
  onDrop: StructureTreeProps['onDrop']
}) {
  const label = isLayoutNode(child) ? `⬚ ${child.layoutId}` : `▢ ${child.componentId}`
  return (
    <div>
      <TreeNode
        draggable
        $selected={selectedId === child.id}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(child.id)
        }}
        onDragStart={(e) =>
          writeDragItem(e, { kind: isLayoutNode(child) ? 'layout' : 'component', nodeId: child.id })
        }
      >
        {label}
      </TreeNode>
      {isLayoutNode(child) ? (
        <div style={{ paddingLeft: 12 }}>
          <LayoutRegions root={root} node={child} selectedId={selectedId} onSelect={onSelect} onDrop={onDrop} />
        </div>
      ) : null}
    </div>
  )
}

function LayoutRegions({
  root,
  node,
  selectedId,
  onSelect,
  onDrop,
}: {
  root: LayoutNode
  node: LayoutNode
  selectedId: string | null
  onSelect: (id: string) => void
  onDrop: StructureTreeProps['onDrop']
}) {
  const def = getLayout(node.layoutId)
  const regions = def ? resolveRegions(def, { ...def.defaultOptions, ...node.options }) : []
  return (
    <>
      {regions.map((region) => (
        <RegionTarget
          key={region.id}
          root={root}
          node={node}
          regionId={region.id}
          regionName={region.name}
          onDrop={onDrop}
        >
          {(node.regions[region.id] ?? []).map((child) => (
            <ChildRow
              key={child.id}
              child={child}
              root={root}
              selectedId={selectedId}
              onSelect={onSelect}
              onDrop={onDrop}
            />
          ))}
        </RegionTarget>
      ))}
    </>
  )
}

export function StructureTree({ root, selectedId, onSelect, onDrop }: StructureTreeProps) {
  return (
    <div data-testid="structure-tree">
      <TreeNode
        $selected={selectedId === root.id}
        onClick={() => onSelect(root.id)}
      >{`⬚ ${root.layoutId} (root)`}</TreeNode>
      <LayoutRegions root={root} node={root} selectedId={selectedId} onSelect={onSelect} onDrop={onDrop} />
    </div>
  )
}
