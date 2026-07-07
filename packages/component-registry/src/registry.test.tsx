import { renderToStaticMarkup } from 'react-dom/server'
import { beforeAll, describe, expect, it } from 'vitest'
import {
  clearComponentRegistryForTesting,
  createComponentRenderer,
  deriveEditableFields,
  hero,
  listComponents,
  migrateProps,
  registerBasicComponents,
  registerComponent,
  type ComponentRenderIssue,
} from './index'

// Mirrors the esbuild runtime-verification harness run during Stage 5.

beforeAll(() => {
  clearComponentRegistryForTesting()
  registerBasicComponents()
})

describe('component registry', () => {
  it('lists components and is idempotent', () => {
    registerBasicComponents()
    expect(listComponents().map((c) => c.id)).toEqual(['cta', 'hero', 'image', 'rich-text'])
  })

  it('filters by category', () => {
    expect(listComponents('marketing').map((c) => c.id)).toEqual(['cta', 'hero'])
  })

  it('throws on duplicate registration', () => {
    expect(() => registerComponent(hero)).toThrow(/already registered/)
  })
})

describe('deriveEditableFields', () => {
  it('derives controls, requiredness, options, help, and overrides from the schema', () => {
    const byName = Object.fromEntries(deriveEditableFields(hero).map((f) => [f.name, f]))
    expect(byName.heading).toMatchObject({ control: 'text', required: true, inline: true, help: 'Main headline' })
    expect(byName.subheading?.required).toBe(false)
    expect(byName.align).toMatchObject({ control: 'select' })
    expect(byName.align?.options).toHaveLength(2)
    expect(byName.ctaHref?.control).toBe('url')
  })
})

describe('migrateProps', () => {
  it('upgrades v1 hero props stepwise (title → heading)', () => {
    const out = migrateProps(hero, 1, { title: 'Old', align: 'left' })
    expect(out).toMatchObject({ heading: 'Old', align: 'left' })
    expect(out).not.toHaveProperty('title')
  })

  it('returns null when a migration step is missing', () => {
    expect(migrateProps({ version: 3, migrations: { 2: (p) => p } }, 1, {})).toBeNull()
  })
})

describe('createComponentRenderer', () => {
  it('migrates, validates, renders, and degrades — never crashes', () => {
    const issues: ComponentRenderIssue[] = []
    const render = createComponentRenderer({ onIssue: (i) => issues.push(i) })

    const migrated = renderToStaticMarkup(
      <>{render({ id: 'h1', componentId: 'hero', version: 1, props: { title: 'Welcome' } })}</>
    )
    expect(migrated).toContain('<h1>Welcome</h1>')

    const unknown = renderToStaticMarkup(
      <>{render({ id: 'x', componentId: 'ghost', version: 1, props: {} })}</>
    )
    expect(unknown).toBe('')

    const invalid = renderToStaticMarkup(
      <>{render({ id: 'c4', componentId: 'cta', version: 1, props: { label: '', href: '/x' } })}</>
    )
    expect(invalid).toContain('Learn more') // defaults applied

    expect(issues.map((i) => i.kind)).toEqual(
      expect.arrayContaining(['unknown-component', 'invalid-props'])
    )
  })
})
