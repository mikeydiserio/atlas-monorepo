'use client'

import { Collapsible } from '@base-ui/react/collapsible'
import styled from 'styled-components'

export const AccordionRoot = styled(Collapsible.Root)``

export const Trigger = styled(Collapsible.Trigger)``

export const Body = styled(Collapsible.Panel)<{ $isOpen?: boolean }>`
  overflow: hidden;
  transition: height 600ms var(--ease-out-expo);
`
