import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { SitePage } from '@/components/site-page'
import { getPublishedPage, resolveTenantByHost } from '@/lib/site-content'

/**
 * The multi-tenant catch-all: host → tenant → published page definition →
 * themed render. Drafts and unknown hosts 404. SEO comes from the page's `seo`
 * block (ADR-0004 — pages carry their metadata as data).
 */

interface RouteProps {
  params: Promise<{ slug?: string[] }>
}

async function resolve({ params }: RouteProps) {
  const [{ slug: slugParts }, headerList] = await Promise.all([params, headers()])
  const host = headerList.get('host') ?? ''
  const tenant = await resolveTenantByHost(host)
  if (!tenant) return null
  const slug = slugParts?.join('/') || 'home'
  const page = await getPublishedPage(tenant.id, slug)
  if (!page) return null
  return { tenant, page }
}

export async function generateMetadata(props: RouteProps): Promise<Metadata> {
  const resolved = await resolve(props)
  if (!resolved) return {}
  const { page } = resolved
  return {
    title: page.seo.title ?? page.metadata.title,
    description: page.seo.description,
    ...(page.seo.canonical ? { alternates: { canonical: page.seo.canonical } } : {}),
    ...(page.seo.noindex ? { robots: { index: false } } : {}),
    openGraph: {
      title: page.seo.title ?? page.metadata.title,
      description: page.seo.description,
      ...(page.seo.ogImage ? { images: [page.seo.ogImage] } : {}),
    },
  }
}

export default async function Page(props: RouteProps) {
  const resolved = await resolve(props)
  if (!resolved) notFound()
  return <SitePage tenant={resolved.tenant} page={resolved.page} />
}
