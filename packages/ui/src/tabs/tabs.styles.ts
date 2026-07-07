'use client'

import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import styled from 'styled-components'

export const List = styled(BaseTabs.List)`
  display: flex;
  gap: calc(4 * 100vw / 375);
  border-bottom: 1px solid var(--color-secondary);
  padding-bottom: calc(1 * 100vw / 375);
  position: relative;

  @media (width >= 800px) {
    gap: calc(4 * 100vw / 1440);
    padding-bottom: calc(1 * 100vw / 1440);
  }
`

export const Tab = styled(BaseTabs.Tab)`
  padding: calc(8 * 100vw / 375) calc(16 * 100vw / 375);
  background: transparent;
  border: none;
  color: var(--color-secondary);
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
  opacity: 0.6;
  transition:
    opacity 150ms ease,
    color 150ms ease;
  position: relative;

  @media (width >= 800px) {
    padding: calc(8 * 100vw / 1440) calc(16 * 100vw / 1440);
  }

  @media (hover: hover) {
    &:hover {
      opacity: 0.8;
    }
  }

  &:focus-visible {
    outline: 2px solid var(--color-contrast);
    outline-offset: 2px;
  }

  &[data-selected] {
    opacity: 1;
    color: var(--color-contrast);
  }

  &[data-disabled] {
    opacity: 0.3;
    cursor: not-allowed;
  }
`

export const Indicator = styled(BaseTabs.Indicator)`
  position: absolute;
  bottom: 0;
  height: 2px;
  background-color: var(--color-contrast);
  transition:
    left 200ms ease-out,
    width 200ms ease-out;
`

export const Panel = styled(BaseTabs.Panel)`
  padding: calc(16 * 100vw / 375) 0;

  @media (width >= 800px) {
    padding: calc(16 * 100vw / 1440) 0;
  }

  &:focus-visible {
    outline: 2px solid var(--color-contrast);
    outline-offset: 2px;
  }
`
