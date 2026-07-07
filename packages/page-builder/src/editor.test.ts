import { registerBasicComponents } from '@atlas/component-registry'
import { registerBuiltInLayouts } from '@atlas/layout-engine'
import type { PageDefinition } from '@atlas/shared'
import { beforeAll, describe, expect, it } from 'vitest'
import {
  buildPalette,
  canDrop,
  canRedo,
  canUndo,
  collectDropZones,
  createEditorState,
  createLayoutNode,
  editorReducer,
  findNode,
  inlineBindingsFor,
  isLayoutNode,
  type EditorState,
} from './index'

// Mirrors the esbuild runtime-verification harness run during Stage 6 (15 checks).

const basePage: PageDefinition = {
  id: 'a1b2c3d4-0001-4a1b-8b2c-000000000001',
  tenantId: 'a1b2c3d4-0002-4a1b-8b2c-000000000002',
  slug: 'home',
  status: 'draft',
  version: 1,
  metadata: { title: 'Home' },
  seo: { ogType: 'website', noindex: false, keywords: [] },
  layout: { id: 'root', layoutId: 'hero-layout', options: {}, regions: { hero: [], content: [] } },
}

beforeAll(() => {
  registerBuiltInLayouts()
  registerBasicComponents()
})

function run(state: EditorState, ...actions: Parameters<typeof editorReducer>[1][]): EditorState {
  return actions.reduce(editorReducer, state)
}

describe('editorReducer', () => {
  it('adds components with registry defaults and current version', () => {
    const state = run(createEditorState(basePage), {
      type: 'add-component',
      componentId: 'hero',
      target: { parentId: 'root', regionId: 'hero' },
      id: 'h1',
    })
    const loc = findNode(state.page.layout, 'h1')
    expect(loc && !isLayoutNode(loc.node) && loc.node.version).toBe(2)
    expect(loc && !isLayoutNode(loc.node) && loc.node.props.heading).toBe('Headline')
    expect(state.selectedId).toBe('h1')
  })

  it('undo/redo round-trips exact snapshots', () => {
    let state = run(createEditorState(basePage), {
      type: 'add-component',
      componentId: 'cta',
      target: { parentId: 'root', regionId: 'content' },
      id: 'c1',
    })
    state = run(state, { type: 'update-props', id: 'c1', patch: { label: 'Changed' } })
    const after = state.page.layout
    expect(canUndo(state)).toBe(true)
    state = run(state, { type: 'undo' })
    const loc = findNode(state.page.layout, 'c1')
    expect(loc && !isLayoutNode(loc.node) && loc.node.props.label).toBe('Learn more')
    expect(canRedo(state)).toBe(true)
    state = run(state, { type: 'redo' })
    expect(state.page.layout).toBe(after)
  })

  it('caps history at the limit', () => {
    let state = createEditorState(basePage)
    for (let i = 0; i < 150; i++) {
      state = run(state, { type: 'update-options', id: 'root', patch: { gap: `${i}px` } })
    }
    expect(state.past.length).toBeLessThanOrEqual(100)
  })
})

describe('drop-zone model', () => {
  it('derives zones and enforces maxChildren from registry metadata', () => {
    const state = run(createEditorState(basePage), {
      type: 'add-component',
      componentId: 'hero',
      target: { parentId: 'root', regionId: 'hero' },
      id: 'h1',
    })
    const zone = collectDropZones(state.page.layout).find((z) => z.regionId === 'hero')
    expect(zone?.maxChildren).toBe(1)
    expect(canDrop(state.page.layout, { kind: 'component' }, zone!)).toMatchObject({
      allowed: false,
      reason: 'region-full',
    })
    // moving the resident child within its own region stays legal
    expect(canDrop(state.page.layout, { kind: 'component', nodeId: 'h1' }, zone!).allowed).toBe(true)
  })
})

describe('palette + inline bindings', () => {
  it('derives palette groups from both registries', () => {
    const categories = buildPalette().map((g) => g.category)
    expect(categories).toContain('marketing')
    expect(categories.some((c) => c.startsWith('layout:'))).toBe(true)
  })

  it('exposes inline-editable fields with current values', () => {
    const state = run(createEditorState(basePage), {
      type: 'add-component',
      componentId: 'hero',
      target: { parentId: 'root', regionId: 'hero' },
      id: 'h1',
    })
    const bindings = inlineBindingsFor(state.page.layout, 'h1')
    expect(bindings.map((b) => b.field.name).sort()).toEqual(['heading', 'subheading'])
  })

  it('seeds dynamic regions for tabs from default options', () => {
    expect(Object.keys(createLayoutNode('tabs', 't1').regions)).toContain('tab:tab-1')
  })
})
