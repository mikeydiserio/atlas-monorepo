'use client'

import type { PageDefinition } from '@atlas/shared'
import { useCallback, useReducer } from 'react'
import {
  canRedo,
  canUndo,
  createEditorState,
  editorReducer,
  type EditorAction,
  type EditorState,
} from './store'

/**
 * Thin React adapter over the pure editor reducer. All behaviour lives in
 * store.ts/tree.ts (headlessly tested); this hook only binds it to React and
 * supplies instance-id generation.
 */

export interface UsePageEditor {
  state: EditorState
  dispatch: (action: EditorAction) => void
  addComponent: (componentId: string, target: { parentId: string; regionId: string; index?: number }) => void
  addLayout: (layoutId: string, target: { parentId: string; regionId: string; index?: number }) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

export function usePageEditor(initial: PageDefinition): UsePageEditor {
  const [state, dispatch] = useReducer(editorReducer, initial, createEditorState)

  const addComponent = useCallback<UsePageEditor['addComponent']>((componentId, target) => {
    dispatch({ type: 'add-component', componentId, target, id: crypto.randomUUID() })
  }, [])

  const addLayout = useCallback<UsePageEditor['addLayout']>((layoutId, target) => {
    dispatch({ type: 'add-layout', layoutId, target, id: crypto.randomUUID() })
  }, [])

  return {
    state,
    dispatch,
    addComponent,
    addLayout,
    undo: useCallback(() => dispatch({ type: 'undo' }), []),
    redo: useCallback(() => dispatch({ type: 'redo' }), []),
    canUndo: canUndo(state),
    canRedo: canRedo(state),
  }
}
