'use client'

import { Switch as BaseSwitch } from '@base-ui/react/switch'
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

export const Root = styled(BaseSwitch.Root)`
  position: relative;
  width: calc(44 * 100vw / 375);
  height: calc(24 * 100vw / 375);
  padding: calc(2 * 100vw / 375);
  background-color: var(--color-secondary);
  opacity: 0.3;
  border-radius: calc(12 * 100vw / 375);
  border: none;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    opacity 150ms ease;
  flex-shrink: 0;

  @media (width >= 800px) {
    width: calc(44 * 100vw / 1440);
    height: calc(24 * 100vw / 1440);
    padding: calc(2 * 100vw / 1440);
    border-radius: calc(12 * 100vw / 1440);
  }

  &:focus-visible {
    outline: 2px solid var(--color-contrast);
    outline-offset: 2px;
  }

  &[data-checked] {
    background-color: var(--color-contrast);
    opacity: 1;
  }

  &[data-disabled] {
    opacity: 0.2;
    cursor: not-allowed;
  }
`

export const Thumb = styled(BaseSwitch.Thumb)`
  display: block;
  width: calc(20 * 100vw / 375);
  height: calc(20 * 100vw / 375);
  background-color: var(--color-primary);
  border-radius: 50%;
  transition: transform 150ms ease;
  box-shadow: 0 1px 3px rgba(0 0 0 / 0.2);

  @media (width >= 800px) {
    width: calc(20 * 100vw / 1440);
    height: calc(20 * 100vw / 1440);
  }

  [data-checked] & {
    transform: translateX(calc(20 * 100vw / 375));

    @media (width >= 800px) {
      transform: translateX(calc(20 * 100vw / 1440));
    }
  }
`
