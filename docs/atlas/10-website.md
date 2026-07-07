# Atlas — Website Renderer

> Stage 9 deliverable. `apps/website`: the multi-tenant public renderer.
> SSR-verified (5 checks): host→tenant resolution, published-only serving,
> tenant-scoped cache tags, themed rendering.

## Request flow

```
GET https://acme-dental.com/some/page
  → resolveTenantByHost(host)          unknown host → platform 404
  → getPublishedPage(tenant.id, slug)  drafts/archived → 404 by contract
  → generateMetadata(page.seo)         SEO is page data (ADR-0004)
  → <SitePage>
       <TenantThemeProvider tokens={tenant.themeTokens}>
         <SiteShell>                    site-wide base theme (bg, text, fonts, accent links)
           <PageRenderer definition renderComponent={createComponentRenderer()} />
```

One catch-all route (`[[...slug]]`) serves every page of every tenant. The renderer and
the editor read the **same registries** — module-scope idempotent registration — so
what an editor composes is exactly what the site renders.

## Key properties

- **Published-only** — the content seam exposes only `status = 'published'` pages; in
  the Supabase implementation this is doubly enforced by the anon RLS policies
  (Stage 2), not just by the query.
- **Tenant theming at the app boundary** — `SiteShell` applies base presentation
  (background, foreground, body/heading fonts, accent links) from tenant tokens, so
  even semantic-markup components read as the tenant's site; richer components layer
  their own theme usage.
- **Render issues degrade silently for visitors** — unknown components render nothing
  publicly (placeholders are an editor affordance); issues go to the server log.
- **Tenant-scoped caching** — `pageCacheTag(tenantId, slug)` = `tenant:{id}:page:{slug}`;
  publishing revalidates exactly one tenant's page (docs/atlas §02.6). ISR wiring rides
  on these tags when the Supabase cms lands.
- **SEO** — `generateMetadata` maps the page's `seo` block (title/description/canonical/
  noindex/OG) straight from the definition.

## The persistence seam

`site-content.ts` mirrors the dashboard's stub pattern: `resolveTenantByHost`,
`getPublishedPage`, `pageCacheTag` are the `@atlas/cms` read contract. The demo tenant
runs a distinct theme (`accent #0e7490`) proving per-tenant presentation end to end.
Host resolution in production uses the service role via middleware/proxy (docs §02.3);
`localhost` maps to the demo tenant for development.

---

*Next: Stage 10 — modules (booking, forms, comms, analytics) + Supabase wiring.*
