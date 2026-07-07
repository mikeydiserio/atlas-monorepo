'use client'

import type { ReactNode } from 'react'
import styled from 'styled-components'
import { defaultTokens, TenantThemeProvider } from '@atlas/theme-engine'
import { demoTenant } from '@/lib/cms-stub'

/**
 * Dashboard chrome: auth guard + tenant switcher + navigation. The dashboard
 * itself renders under the PLATFORM default theme — tenant themes apply only
 * inside the editor canvas (the tenant's site preview), never to admin chrome.
 */

// Placeholder until @atlas/authentication wires Supabase sessions (Stage 10).
// The guard boundary exists now so routes are written against it from day one.
function AuthGuard({ children }: { children: ReactNode }) {
  const session = { user: { email: 'dev@agency.local' }, role: 'agency_admin' as const }
  if (!session) return <p>Redirecting to sign-in…</p>
  return <>{children}</>
}

const Bar = styled.header`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  background: ${({ theme }) => theme.color.background};
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
`

const Brand = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`

const TenantSelect = styled.select`
  margin-left: auto;
  padding: 0.4rem 0.6rem;
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.color.background};
  color: ${({ theme }) => theme.color.foreground};
`

const Main = styled.main`
  min-height: 100dvh;
  background: ${({ theme }) => theme.color.muted};
  color: ${({ theme }) => theme.color.foreground};
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
`

/** Single-tenant demo roster until @atlas/cms lists real memberships. */
function TenantSwitcher() {
  return (
    <TenantSelect aria-label="Active tenant" defaultValue={demoTenant.id}>
      <option value={demoTenant.id}>{demoTenant.name}</option>
    </TenantSelect>
  )
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <TenantThemeProvider tokens={defaultTokens}>
      <AuthGuard>
        <Bar>
          <Brand>Atlas</Brand>
          <span>Pages</span>
          <TenantSwitcher />
        </Bar>
        <Main>{children}</Main>
      </AuthGuard>
    </TenantThemeProvider>
  )
}
