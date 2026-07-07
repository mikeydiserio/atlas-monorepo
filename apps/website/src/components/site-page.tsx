'use client'

import { createComponentRenderer, registerBasicComponents } from '@atlas/component-registry'
import { PageRenderer, registerBuiltInLayouts } from '@atlas/layout-engine'
import type { PageDefinition } from '@atlas/shared'
import { TenantThemeProvider } from '@atlas/theme-engine'
import styled from 'styled-components'
import type { SiteTenant } from '@/lib/site-content'

// Same idempotent module-scope registration as the editor: the renderer and
// the editor read one catalog (ADR-0005).
registerBuiltInLayouts()
registerBasicComponents()

/**
 * Site-wide base presentation from the tenant theme: page background, text
 * colour, body font, and accent-coloured links. Components layer their own
 * theme usage on top; this is what makes even semantic-markup components read
 * as "the tenant's site".
 */
const SiteShell = styled.div`
  min-height: 100dvh;
  background: ${({ theme }) => theme.color.background};
  color: ${({ theme }) => theme.color.foreground};
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};

  a {
    color: ${({ theme }) => theme.color.accent};
  }

  h1,
  h2,
  h3 {
    font-family: ${({ theme }) => theme.typography.fontFamily.heading};
    text-wrap: balance;
  }
`

/**
 * The public page renderer: page definition → registries → themed HTML.
 * Unknown components render nothing on the public site (renderUnknown is only
 * an editor affordance); issues surface to the server log, never the visitor.
 */
export function SitePage({ tenant, page }: { tenant: SiteTenant; page: PageDefinition }) {
  const renderComponent = createComponentRenderer({
    onIssue: (issue) => console.warn(`[atlas:render] ${page.slug}#${issue.nodeId}: ${issue.detail}`),
  })
  return (
    <TenantThemeProvider tokens={tenant.themeTokens}>
      <SiteShell>
        <PageRenderer
          definition={page}
          renderComponent={renderComponent}
          onIssue={(issue) => console.warn(`[atlas:layout] ${page.slug}#${issue.nodeId}: ${issue.detail}`)}
        />
      </SiteShell>
    </TenantThemeProvider>
  )
}
