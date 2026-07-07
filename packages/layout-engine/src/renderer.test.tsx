import type { ComponentNode } from '@atlas/shared'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeAll, describe, expect, it } from 'vitest'
import { clearLayoutRegistryForTesting, listLayouts, registerBuiltInLayouts, registerLayout, tabs } from './index'
import { renderLayoutNode, type RenderIssue } from './renderer'
import { getLayout } from './registry'
import { resolveRegions } from './types'

// Mirrors the esbuild runtime-verification harness run during Stage 4.

const renderComponent = (node: ComponentNode) => (
  <span data-stub={node.componentId}>{String(node.props.text ?? node.componentId)}</span>
)

beforeAll(() => {
  clearLayoutRegistryForTesting()
  registerBuiltInLayouts()
})

describe('layout registry', () => {
  it('holds the 12 built-in layouts and is idempotent', () => {
    registerBuiltInLayouts()
    expect(listLayouts()).toHaveLength(12)
  })

  it('throws on duplicate registration', () => {
    expect(() => registerLayout(tabs)).toThrow(/already registered/)
  })

  it('derives dynamic regions from options (tabs)', () => {
    const layout = getLayout('tabs')
    expect(layout).toBeDefined()
    const regions = resolveRegions(layout!, {
      items: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
    })
    expect(regions.map((r) => r.id)).toEqual(['tab:a', 'tab:b'])
  })
})

describe('renderLayoutNode', () => {
  it('renders a nested layout/component tree', () => {
    const html = renderToStaticMarkup(
      <>{renderLayoutNode(
        {
          id: 'root',
          layoutId: 'two-column-70-30',
          options: {},
          regions: {
            left: [{ id: 'c1', componentId: 'hero', version: 1, props: { text: 'HERO' } }],
            right: [
              {
                id: 'g1',
                layoutId: 'grid',
                options: { columns: 2 },
                regions: { cells: [{ id: 'c2', componentId: 'cta', version: 1, props: { text: 'CTA' } }] },
              },
            ],
          },
        },
        { renderComponent }
      )}</>
    )
    expect(html).toContain('data-atlas-layout="two-column-70-30"')
    expect(html).toContain('data-atlas-layout="grid"')
    expect(html).toContain('HERO')
    expect(html).toContain('CTA')
  })

  it('reports unknown layouts instead of crashing', () => {
    const issues: RenderIssue[] = []
    const html = renderToStaticMarkup(
      <>{renderLayoutNode(
        { id: 'x', layoutId: 'nope', options: {}, regions: {} },
        { renderComponent, onIssue: (i) => issues.push(i) }
      )}</>
    )
    expect(html).toBe('')
    expect(issues[0]?.kind).toBe('unknown-layout')
  })

  it('reports content authored into undeclared regions', () => {
    const issues: RenderIssue[] = []
    renderToStaticMarkup(
      <>{renderLayoutNode(
        {
          id: 'x',
          layoutId: 'single-column',
          options: {},
          regions: { main: [], bogus: [{ id: 'c9', componentId: 'cta', version: 1, props: {} }] },
        },
        { renderComponent, onIssue: (i) => issues.push(i) }
      )}</>
    )
    expect(issues.some((i) => i.kind === 'undeclared-region')).toBe(true)
  })

  it('degrades invalid options to defaults', () => {
    const issues: RenderIssue[] = []
    const html = renderToStaticMarkup(
      <>{renderLayoutNode(
        { id: 'g', layoutId: 'grid', options: { columns: 99 }, regions: { cells: [] } },
        { renderComponent, onIssue: (i) => issues.push(i) }
      )}</>
    )
    expect(issues.some((i) => i.kind === 'invalid-options')).toBe(true)
    expect(html).toContain('repeat(3, 1fr)')
  })
})
