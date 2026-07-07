import { themeTokensSchema } from '@atlas/shared'
import { renderToStaticMarkup } from 'react-dom/server'
import { ServerStyleSheet } from 'styled-components'
import { describe, expect, it } from 'vitest'
import { buildTheme, defaultTokens, safeBuildTheme } from './theme'
import { TenantThemeProvider } from './provider'

// Mirrors the esbuild runtime-verification harness run during Stage 7.

function renderWithSheet(node: React.ReactNode): { html: string; css: string } {
  const sheet = new ServerStyleSheet()
  try {
    const html = renderToStaticMarkup(sheet.collectStyles(<>{node}</>))
    return { html, css: sheet.getStyleTags() }
  } finally {
    sheet.seal()
  }
}

describe('theme resolution', () => {
  it('defaultTokens validate against the shared schema', () => {
    expect(() => themeTokensSchema.parse(defaultTokens)).not.toThrow()
  })

  it('dark mode merges darkPalette overrides over the base palette', () => {
    const dark = buildTheme(defaultTokens, 'dark')
    expect(dark.color.background).toBe('#0a0a0a')
    expect(dark.color.accent).toBe(defaultTokens.palette.accent) // non-overridden persists
    expect(buildTheme(defaultTokens, 'light').color.background).toBe('#ffffff')
  })

  it('safeBuildTheme degrades invalid tokens to defaults and reports', () => {
    let reported = false
    const theme = safeBuildTheme({ garbage: true }, 'light', () => {
      reported = true
    })
    expect(reported).toBe(true)
    expect(theme.color.accent).toBe(defaultTokens.palette.accent)
  })
})

describe('TenantThemeProvider', () => {
  const acme = themeTokensSchema.parse({
    ...defaultTokens,
    palette: { ...defaultTokens.palette, accent: '#ff0066' },
  })

  it('flows tenant tokens into descendant styled-components CSS', () => {
    const { css } = renderWithSheet(
      <TenantThemeProvider tokens={acme}>
        <ThemedProbe />
      </TenantThemeProvider>
    )
    expect(css).toContain('#ff0066')
  })

  it('isolates themes between tenants', () => {
    const a = renderWithSheet(
      <TenantThemeProvider tokens={acme}>
        <ThemedProbe />
      </TenantThemeProvider>
    )
    const b = renderWithSheet(
      <TenantThemeProvider tokens={defaultTokens}>
        <ThemedProbe />
      </TenantThemeProvider>
    )
    expect(a.css).toContain('#ff0066')
    expect(b.css).not.toContain('#ff0066')
  })
})

// Local probe so this package's tests don't depend on @atlas/ui (Tier order).
import styled from 'styled-components'
const Probe = styled.div`
  color: ${({ theme }) => theme.color.accent};
`
function ThemedProbe() {
  return <Probe>probe</Probe>
}
