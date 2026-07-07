import { pageDefinitionSchema, themeTokensSchema, type PageDefinition, type ThemeTokens } from '@atlas/shared'
import { defaultTokens } from '@atlas/theme-engine'

/**
 * Site content access — the renderer's @atlas/cms read seam. Stubbed in-memory
 * until Supabase wiring (Stage 10); the signatures are the cms contract:
 * host → tenant, published pages only, active theme, cache-tag helpers.
 *
 * The real implementation queries with the anon key — RLS itself guarantees
 * only published content is readable (docs/atlas §03) — and host resolution
 * uses the service role server-side.
 */

export interface SiteTenant {
  id: string
  slug: string
  name: string
  themeTokens: ThemeTokens
}

const TENANT: SiteTenant = {
  id: 'a1b2c3d4-0002-4a1b-8b2c-000000000002',
  slug: 'acme-dental',
  name: 'Acme Dental (demo)',
  themeTokens: themeTokensSchema.parse({
    ...defaultTokens,
    palette: { ...defaultTokens.palette, accent: '#0e7490' },
  }),
}

const HOSTS: Record<string, string> = {
  'acme-dental.localhost:3002': TENANT.id,
  'acme-dental.localhost': TENANT.id,
  localhost: TENANT.id, // dev convenience
  'localhost:3002': TENANT.id,
}

const publishedPages: PageDefinition[] = [
  pageDefinitionSchema.parse({
    id: 'a1b2c3d4-0001-4a1b-8b2c-000000000001',
    tenantId: TENANT.id,
    slug: 'home',
    status: 'published',
    version: 3,
    metadata: { title: 'Home' },
    seo: {
      title: 'Acme Dental — Gentle care',
      description: 'Family dentistry with same-week appointments.',
      ogType: 'website',
    },
    publishedAt: new Date().toISOString(),
    layout: {
      id: 'root',
      layoutId: 'hero-layout',
      options: {},
      regions: {
        hero: [
          {
            id: 'h1',
            componentId: 'hero',
            version: 2,
            props: {
              heading: 'Gentle dental care for the whole family',
              subheading: 'Same-week appointments, transparent pricing.',
              align: 'center',
              ctaLabel: 'Book an appointment',
              ctaHref: '/book',
            },
          },
        ],
        content: [
          {
            id: 'g1',
            layoutId: 'grid',
            options: { columns: 2 },
            regions: {
              cells: [
                { id: 'c1', componentId: 'rich-text', version: 1, props: { html: '<p>Modern clinic, caring team.</p>' } },
                { id: 'c2', componentId: 'cta', version: 1, props: { label: 'Meet the team', href: '/team', variant: 'secondary' } },
              ],
            },
          },
        ],
      },
    },
  }),
]

/** Host → tenant. Unknown hosts resolve to null → platform 404. */
export async function resolveTenantByHost(host: string): Promise<SiteTenant | null> {
  const tenantId = HOSTS[host.toLowerCase()]
  return tenantId === TENANT.id ? TENANT : null
}

/** Published pages only — drafts are invisible to the renderer by contract. */
export async function getPublishedPage(tenantId: string, slug: string): Promise<PageDefinition | null> {
  return (
    publishedPages.find(
      (p) => p.tenantId === tenantId && p.slug === slug && p.status === 'published'
    ) ?? null
  )
}

/** Tenant-scoped cache tag (docs/atlas §02.6): publish invalidates exactly this. */
export function pageCacheTag(tenantId: string, slug: string): string {
  return `tenant:${tenantId}:page:${slug}`
}
