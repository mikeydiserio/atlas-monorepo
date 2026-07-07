import '@atlas/layout-engine/structural.css'
import type { ReactNode } from 'react'
import { StyledComponentsRegistry } from '@/lib/styled-registry'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  )
}
