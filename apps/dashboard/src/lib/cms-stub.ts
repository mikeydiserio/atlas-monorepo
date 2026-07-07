import { pageDefinitionSchema, type PageDefinition } from '@atlas/shared'

/**
 * CMS stub — the dashboard's persistence seam until @atlas/cms lands on
 * Supabase (Stage 10 wiring). The function signatures ARE the @atlas/cms
 * contract: swapping this module for the real client changes no editor code.
 *
 * In-memory, per-server-process. Seeded with one demo page per tenant.
 */

export interface SaveResult {
  ok: boolean
  version: number
  savedAt: string
}

export interface PublishResult {
  ok: boolean
  publishedAt: string
}

const TENANT_ID = 'a1b2c3d4-0002-4a1b-8b2c-000000000002'

const seedPage: PageDefinition = pageDefinitionSchema.parse({
  id: 'a1b2c3d4-0001-4a1b-8b2c-000000000001',
  tenantId: TENANT_ID,
  slug: 'home',
  status: 'draft',
  version: 1,
  metadata: { title: 'Home' },
  seo: { title: 'Home' },
  layout: {
    id: 'root',
    layoutId: 'hero-layout',
    options: {},
    regions: {
      hero: [
        {
          id: 'seed-hero',
          componentId: 'hero',
          version: 2,
          props: { heading: 'Welcome to Atlas', subheading: 'Edit me inline.', align: 'center' },
        },
      ],
      content: [
        {
          id: 'seed-grid',
          layoutId: 'grid',
          options: { columns: 2 },
          regions: {
            cells: [
              { id: 'seed-cta', componentId: 'cta', version: 1, props: { label: 'Get started', href: '#', variant: 'primary' } },
              { id: 'seed-text', componentId: 'rich-text', version: 1, props: { html: '<p>Drop components here.</p>' } },
            ],
          },
        },
      ],
    },
  },
})

const drafts = new Map<string, PageDefinition>([[seedPage.id, seedPage]])
const published = new Map<string, PageDefinition>()

export async function listPages(tenantId: string): Promise<PageDefinition[]> {
  return [...drafts.values()].filter((p) => p.tenantId === tenantId)
}

export async function getPageDraft(pageId: string): Promise<PageDefinition | null> {
  return drafts.get(pageId) ?? null
}

export async function savePageDraft(page: PageDefinition): Promise<SaveResult> {
  // Validation at the persistence boundary — same rule the real cms enforces.
  const parsed = pageDefinitionSchema.parse({ ...page, version: page.version + 1 })
  drafts.set(parsed.id, parsed)
  return { ok: true, version: parsed.version, savedAt: new Date().toISOString() }
}

export async function publishPage(pageId: string): Promise<PublishResult> {
  const draft = drafts.get(pageId)
  if (!draft) throw new Error(`publishPage: unknown page '${pageId}'`)
  const now = new Date().toISOString()
  const live = pageDefinitionSchema.parse({ ...draft, status: 'published', publishedAt: now })
  published.set(pageId, live)
  drafts.set(pageId, { ...draft, status: 'published', publishedAt: now })
  return { ok: true, publishedAt: now }
}

export async function schedulePage(pageId: string, whenIso: string): Promise<PublishResult> {
  const draft = drafts.get(pageId)
  if (!draft) throw new Error(`schedulePage: unknown page '${pageId}'`)
  drafts.set(pageId, { ...draft, status: 'scheduled', scheduledFor: whenIso })
  return { ok: true, publishedAt: whenIso }
}

export const demoTenant = {
  id: TENANT_ID,
  name: 'Acme Dental (demo)',
  slug: 'acme-dental',
} as const
