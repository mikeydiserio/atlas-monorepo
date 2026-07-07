'use client'

import {
  createComponentRenderer,
  registerBasicComponents,
} from '@atlas/component-registry'
import { PageRenderer, registerBuiltInLayouts } from '@atlas/layout-engine'
import { buildPalette, usePageEditor } from '@atlas/page-builder'
import type { PageDefinition } from '@atlas/shared'
import { defaultTokens, TenantThemeProvider } from '@atlas/theme-engine'
import { Button } from '@atlas/ui'
import { useState, useTransition } from 'react'
import { publishAction, saveDraftAction, scheduleAction } from '@/app/editor/actions'
import {
  CanvasScroll,
  CanvasSheet,
  EditorGrid,
  GroupLabel,
  Panel,
  PaletteItem,
  SelectableWrap,
  Toolbar,
} from './editor.styles'
import { Inspector } from './inspector'
import { StructureTree, writeDragItem, type TreeDropEvent } from './structure-tree'

// Registries are module-scope and idempotent: importing the editor makes the
// full catalog available. New layouts/components appear with no editor change.
registerBuiltInLayouts()
registerBasicComponents()

const PREVIEW_WIDTHS = [
  { label: 'Mobile', width: 375 },
  { label: 'Tablet', width: 768 },
  { label: 'Desktop', width: 1100 },
] as const

export function Editor({ initial }: { initial: PageDefinition }) {
  const editor = usePageEditor(initial)
  const { state, dispatch } = editor
  const [previewWidth, setPreviewWidth] = useState<number>(1100)
  const [pending, startTransition] = useTransition()
  const [statusLine, setStatusLine] = useState('')

  const palette = buildPalette()

  const handleTreeDrop = ({ item, target }: TreeDropEvent) => {
    if (item.nodeId) {
      dispatch({ type: 'move', id: item.nodeId, target })
    } else if (item.paletteId) {
      if (item.kind === 'component') editor.addComponent(item.paletteId, target)
      else editor.addLayout(item.paletteId, target)
    }
  }

  // Canvas selection: wrap every rendered component in a selectable frame.
  const renderComponent = createComponentRenderer({
    renderUnknown: (node) => <div data-unknown-component={node.componentId}>Unknown: {node.componentId}</div>,
  })
  const selectableRenderer: typeof renderComponent = (node) => (
    <SelectableWrap
      $selected={state.selectedId === node.id}
      onClick={(e) => {
        e.stopPropagation()
        dispatch({ type: 'select', id: node.id })
      }}
      data-node-id={node.id}
    >
      {renderComponent(node)}
    </SelectableWrap>
  )

  const save = () =>
    startTransition(async () => {
      const result = await saveDraftAction(state.page)
      dispatch({ type: 'mark-saved' })
      setStatusLine(`Draft v${result.version} saved`)
    })

  const publish = () =>
    startTransition(async () => {
      await saveDraftAction(state.page)
      dispatch({ type: 'mark-saved' })
      const result = await publishAction(state.page.id)
      setStatusLine(`Published at ${new Date(result.publishedAt).toLocaleTimeString()}`)
    })

  const schedule = (whenIso: string) =>
    startTransition(async () => {
      await saveDraftAction(state.page)
      dispatch({ type: 'mark-saved' })
      await scheduleAction(state.page.id, whenIso)
      setStatusLine(`Scheduled for ${new Date(whenIso).toLocaleString()}`)
    })

  return (
    <EditorGrid>
      <Toolbar>
        <strong>/{state.page.slug}</strong>
        <Button variant="ghost" onClick={editor.undo} disabled={!editor.canUndo} aria-label="Undo">
          ↶ Undo
        </Button>
        <Button variant="ghost" onClick={editor.redo} disabled={!editor.canRedo} aria-label="Redo">
          ↷ Redo
        </Button>
        <span style={{ marginLeft: 'auto', opacity: 0.7, fontSize: '0.85rem' }}>
          {pending ? 'Working…' : statusLine || (state.dirty ? 'Unsaved changes' : 'Up to date')}
        </span>
        {PREVIEW_WIDTHS.map((p) => (
          <Button
            key={p.width}
            variant={previewWidth === p.width ? 'secondary' : 'ghost'}
            onClick={() => setPreviewWidth(p.width)}
          >
            {p.label}
          </Button>
        ))}
        <Button variant="secondary" onClick={save} disabled={pending || !state.dirty}>
          Save draft
        </Button>
        <input
          type="datetime-local"
          aria-label="Schedule publish time"
          onChange={(e) => e.target.value && schedule(new Date(e.target.value).toISOString())}
        />
        <Button variant="primary" onClick={publish} disabled={pending}>
          Publish
        </Button>
      </Toolbar>

      <Panel $area="palette">
        <GroupLabel>Structure</GroupLabel>
        <StructureTree
          root={state.page.layout}
          selectedId={state.selectedId}
          onSelect={(id) => dispatch({ type: 'select', id })}
          onDrop={handleTreeDrop}
        />
        {palette.map((group) => (
          <div key={group.category}>
            <GroupLabel>{group.category}</GroupLabel>
            {group.entries.map((entry) => (
              <PaletteItem
                key={`${entry.kind}:${entry.id}`}
                draggable
                title={entry.description}
                onDragStart={(e) => writeDragItem(e, { kind: entry.kind, paletteId: entry.id })}
              >
                {entry.name}
              </PaletteItem>
            ))}
          </div>
        ))}
      </Panel>

      <CanvasScroll onClick={() => dispatch({ type: 'select', id: null })}>
        <CanvasSheet style={{ '--preview-width': `${previewWidth}px` } as React.CSSProperties}>
          {/* The canvas renders the tenant's ACTUAL site output: real PageRenderer,
              real tenant theme. Editing overlays wrap components, not replace them. */}
          <TenantThemeProvider tokens={defaultTokens}>
            <PageRenderer definition={state.page} renderComponent={selectableRenderer} />
          </TenantThemeProvider>
        </CanvasSheet>
      </CanvasScroll>

      <Panel $area="inspector">
        <Inspector
          root={state.page.layout}
          selectedId={state.selectedId}
          onPatchProps={(id, patch) => dispatch({ type: 'update-props', id, patch })}
          onPatchOptions={(id, patch) => dispatch({ type: 'update-options', id, patch })}
        />
        {state.selectedId && state.selectedId !== state.page.layout.id ? (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Button
              variant="secondary"
              onClick={() =>
                dispatch({ type: 'duplicate', id: state.selectedId!, newId: () => crypto.randomUUID() })
              }
            >
              Duplicate
            </Button>
            <Button variant="ghost" onClick={() => dispatch({ type: 'remove', id: state.selectedId! })}>
              Remove
            </Button>
          </div>
        ) : null}
      </Panel>
    </EditorGrid>
  )
}
