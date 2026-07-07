'use client'

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import styled from 'styled-components'

export const Container = styled.label`
  display: flex;
  align-items: center;
  gap: calc(8 * 100vw / 375);
  cursor: pointer;

  @media (width >= 800px) {
    gap: calc(8 * 100vw / 1440);
  }
`

export const Label = styled.span`
  color: var(--color-secondary);
  font-size: inherit;
  user-select: none;
`

export const Root = styled(BaseCheckbox.Root)`
  width: calc(20 * 100vw / 375);
  height: calc(20 * 100vw / 375);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-secondary);
  border-radius: calc(4 * 100vw / 375);
  background-color: transparent;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    border-color 150ms ease;
  flex-shrink: 0;

  @media (width >= 800px) {
    width: calc(20 * 100vw / 1440);
    height: calc(20 * 100vw / 1440);
    border-radius: calc(4 * 100vw / 1440);
  }

  &:focus-visible {
    outline: 2px solid var(--color-contrast);
    outline-offset: 2px;
  }

  &[data-checked],
  &[data-indeterminate] {
    background-color: var(--color-contrast);
    border-color: var(--color-contrast);
  }

  &[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const Indicator = styled(BaseCheckbox.Indicator)`
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
`
