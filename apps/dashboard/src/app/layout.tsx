import '@atlas/layout-engine/structural.css'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { StyledComponentsRegistry } from '@/lib/styled-registry'
import { Shell } from '@/components/shell/shell'

export const metadata: Metadata = {
  title: 'Atlas Dashboard',
  description: 'Agency and tenant administration for the Atlas platform.',
  robots: { index: false },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <StyledComponentsRegistry>
          <Shell>{children}</Shell>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
