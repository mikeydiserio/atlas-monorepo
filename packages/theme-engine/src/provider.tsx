'use client'

import type { ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'
import { safeBuildTheme, type ThemeMode } from './theme'

/**
 * Per-tenant theme boundary (docs/atlas §02.4). Every tenant render tree is
 * wrapped in exactly one TenantThemeProvider; components below it consume
 * theme tokens and never hard-code presentation. Invalid tokens degrade to
 * platform defaults — a broken theme row never takes a site down.
 */

export interface TenantThemeProviderProps {
  /** The tenant's `themes.tokens` JSONB — validated here at the boundary. */
  tokens: unknown
  mode?: ThemeMode
  onInvalid?: (detail: string) => void
  children: ReactNode
}

export function TenantThemeProvider({ tokens, mode = 'light', onInvalid, children }: TenantThemeProviderProps) {
  const theme = safeBuildTheme(tokens, mode, onInvalid)
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}
