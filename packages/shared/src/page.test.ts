import { describe, expect, it } from 'vitest'
import { pageDefinitionSchema, layoutNodeSchema, walkComponents } from './page'

// The page model is the platform's most critical contract (ADR-0004). These
// tests exercise the recursive layout/component tree — the highest-risk part of
// the schema — validated at runtime with esbuild during Stage 3.

const nestedPage = {
  id: 'a1b2c3d4-0001-4a1b-8b2c-000000000001',
  tenantId: 'a1b2c3d4-0002-4a1b-8b2c-000000000002',
  slug: 'home',
  status: 'published' as const,
  version: 3,
  metadata: { title: 'Home' },
  seo: { title: 'Home', description: 'Welcome' },
  layout: {
    id: 'root',
    layoutId: 'two-column-70-30',
    options: {},
    regions: {
      left: [{ id: 'c1', componentId: 'hero', version: 1, props: { heading: 'Hi' } }],
      right: [
        {
          id: 'grid1',
          layoutId: 'grid',
          options: { columns: 2 },
          regions: {
            cells: [
              { id: 'c2', componentId: 'cta', version: 1, props: {} },
              { id: 'c3', componentId: 'image', version: 2, props: { src: '/a.jpg' } },
            ],
          },
        },
      ],
    },
  },
}

describe('pageDefinitionSchema', () => {
  it('parses a nested layout/component tree', () => {
    const parsed = pageDefinitionSchema.parse(nestedPage)
    expect(parsed.slug).toBe('home')
  })

  it('rejects an invalid status', () => {
    const bad = { ...nestedPage, status: 'live' }
    expect(pageDefinitionSchema.safeParse(bad).success).toBe(false)
  })
})

describe('layoutNodeSchema', () => {
  it('rejects a layout node missing layoutId', () => {
    expect(layoutNodeSchema.safeParse({ id: 'x', options: {}, regions: {} }).success).toBe(false)
  })
})

describe('walkComponents', () => {
  it('yields every component across nested layouts', () => {
    const parsed = pageDefinitionSchema.parse(nestedPage)
    const ids = [...walkComponents(parsed.layout)].map((c) => c.id).sort()
    expect(ids).toEqual(['c1', 'c2', 'c3'])
  })
})
