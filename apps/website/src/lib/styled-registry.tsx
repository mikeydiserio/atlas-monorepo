'use client'

import { useServerInsertedHTML } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { ServerStyleSheet, StyleSheetManager } from 'styled-components'

/**
 * styled-components SSR registry (the documented Next App Router pattern):
 * collects styles during server render and flushes them into the HTML stream,
 * so themed markup arrives styled with no flash.
 */
export function StyledComponentsRegistry({ children }: { children: ReactNode }) {
  const [sheet] = useState(() => new ServerStyleSheet())

  useServerInsertedHTML(() => {
    const styles = sheet.getStyleElement()
    sheet.instance.clearTag()
    return <>{styles}</>
  })

  if (typeof window !== 'undefined') return <>{children}</>
  return <StyleSheetManager sheet={sheet.instance}>{children}</StyleSheetManager>
}
