import type { ComponentNode, LayoutNode, PageDefinition, RegionChild } from '@atlas/shared'
import { getComponent } from '@atlas/component-registry'
import { getLayout, resolveRegions } from '@atlas/layout-engine'
import {
  duplicateNode,
  insertChild,
  moveNode,
  removeNode,
  updateComponentProps,
  updateLayoutOptions,
  type InsertTarget,
} from './tree'

/**
 * The editor state model — a pure reducer. No React, no DnD library, no
 * network: those are thin adapters on top (see react.ts). Purity is what makes
 * undo/redo trivial and the whole editor testable headlessly.
 */

export interface EditorState {
  page: PageDefinition
  selectedId: string | null
  /** Undo/redo stacks hold layout snapshots (immutable trees, cheap to keep). */
  past: LayoutNode[]
  future: LayoutNode[]
  /** True when the draft has unsaved changes. */
  dirty: boolean
}

export const HISTORY_LIMIT = 100

export type EditorAction =
  | { type: 'load'; page: PageDefinition }
  | { type: 'select'; id: string | null }
  | { type: 'add-component'; componentId: string; target: InsertTarget; id: string }
  | { type: 'add-layout'; layoutId: string; target: InsertTarget; id: string }
  | { type: 'remove'; id: string }
  | { type: 'duplicate'; id: string; newId: () => string }
  | { type: 'move'; id: string; target: InsertTarget }
  | { type: 'update-props'; id: string; patch: Record<string, unknown> }
  | { type: 'update-options'; id: string; patch: Record<string, unknown> }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'mark-saved' }

export function createEditorState(page: PageDefinition): EditorState {
  return { page, selectedId: null, past: [], future: [], dirty: false }
}

/** Push the current layout onto the past stack and apply the new one. */
function commit(state: EditorState, layout: LayoutNode): EditorState {
  return {
    ...state,
    page: { ...state.page, layout },
    past: [...state.past.slice(-(HISTORY_LIMIT - 1)), state.page.layout],
    future: [],
    dirty: true,
  }
}

/** Build a fresh ComponentNode from its registry definition. */
export function createComponentNode(componentId: string, id: string): ComponentNode {
  const def = getComponent(componentId)
  if (!def) throw new Error(`createComponentNode: no component registered for '${componentId}'`)
  return { id, componentId, version: def.version, props: { ...def.defaultProps } }
}

/** Build a fresh LayoutNode with empty declared regions. */
export function createLayoutNode(layoutId: string, id: string): LayoutNode {
  const def = getLayout(layoutId)
  if (!def) throw new Error(`createLayoutNode: no layout registered for '${layoutId}'`)
  const options = { ...def.defaultOptions }
  const regions: Record<string, RegionChild[]> = {}
  for (const region of resolveRegions(def, options)) regions[region.id] = []
  return { id, layoutId, options, regions }
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'load':
      return createEditorState(action.page)

    case 'select':
      return { ...state, selectedId: action.id }

    case 'add-component': {
      const node = createComponentNode(action.componentId, action.id)
      const layout = insertChild(state.page.layout, action.target, node)
      return { ...commit(state, layout), selectedId: node.id }
    }

    case 'add-layout': {
      const node = createLayoutNode(action.layoutId, action.id)
      const layout = insertChild(state.page.layout, action.target, node)
      return { ...commit(state, layout), selectedId: node.id }
    }

    case 'remove': {
      const { root } = removeNode(state.page.layout, action.id)
      const next = commit(state, root)
      return state.selectedId === action.id ? { ...next, selectedId: null } : next
    }

    case 'duplicate': {
      const { root, copy } = duplicateNode(state.page.layout, action.id, action.newId)
      return { ...commit(state, root), selectedId: copy.id }
    }

    case 'move':
      return commit(state, moveNode(state.page.layout, action.id, action.target))

    case 'update-props':
      return commit(state, updateComponentProps(state.page.layout, action.id, action.patch))

    case 'update-options':
      return commit(state, updateLayoutOptions(state.page.layout, action.id, action.patch))

    case 'undo': {
      const previous = state.past.at(-1)
      if (!previous) return state
      return {
        ...state,
        page: { ...state.page, layout: previous },
        past: state.past.slice(0, -1),
        future: [state.page.layout, ...state.future],
        dirty: true,
      }
    }

    case 'redo': {
      const [next, ...rest] = state.future
      if (!next) return state
      return {
        ...state,
        page: { ...state.page, layout: next },
        past: [...state.past, state.page.layout],
        future: rest,
        dirty: true,
      }
    }

    case 'mark-saved':
      return { ...state, dirty: false }
  }
}

export const canUndo = (state: EditorState): boolean => state.past.length > 0
export const canRedo = (state: EditorState): boolean => state.future.length > 0
