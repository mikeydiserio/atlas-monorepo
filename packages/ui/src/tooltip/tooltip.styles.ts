'use client'

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import styled from 'styled-components'

export const Popup = styled(BaseTooltip.Popup)`
  background-color: var(--color-secondary);
  color: var(--color-primary);
  padding: calc(6 * 100vw / 375) calc(10 * 100vw / 375);
  border-radius: calc(4 * 100vw / 375);
  font-size: 0.875rem;
  max-width: 280px;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0 0 0 / 0.15);

  transform-origin: var(--transform-origin);
  transition:
    transform 150ms ease-out,
    opacity 150ms ease-out;
  opacity: 1;
  transform: scale(1);

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: scale(0.95);
  }

  @media (width >= 800px) {
    padding: calc(6 * 100vw / 1440) calc(10 * 100vw / 1440);
    border-radius: calc(4 * 100vw / 1440);
  }
`

export const Arrow = styled(BaseTooltip.Arrow)`
  fill: var(--color-secondary);

  &[data-side='top'] {
    bottom: -8px;
  }

  &[data-side='bottom'] {
    top: -8px;
  }

  &[data-side='left'] {
    right: -8px;
  }

  &[data-side='right'] {
    left: -8px;
  }
`
