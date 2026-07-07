'use client'

import { Toast as BaseToast } from '@base-ui/react/toast'
import styled, { css } from 'styled-components'

export const Viewport = styled(BaseToast.Viewport)`
  position: fixed;
  bottom: calc(16 * 100vw / 375);
  right: calc(16 * 100vw / 375);
  display: flex;
  flex-direction: column;
  gap: calc(8 * 100vw / 375);
  z-index: 200;
  max-width: min(400px, calc(100vw - 32px));

  @media (width >= 800px) {
    bottom: calc(16 * 100vw / 1440);
    right: calc(16 * 100vw / 1440);
    gap: calc(8 * 100vw / 1440);
  }
`

export const Root = styled(BaseToast.Root)<{ $type?: string }>`
  display: flex;
  align-items: flex-start;
  gap: calc(12 * 100vw / 375);
  padding: calc(12 * 100vw / 375) calc(16 * 100vw / 375);
  background-color: var(--color-primary);
  border: 1px solid var(--color-secondary);
  border-radius: calc(8 * 100vw / 375);
  box-shadow: 0 4px 12px rgba(0 0 0 / 0.15);
  position: relative;

  transition:
    transform 200ms ease-out,
    opacity 200ms ease-out;
  opacity: 1;
  transform: translateX(0);

  &[data-starting-style] {
    opacity: 0;
    transform: translateX(100%);
  }

  &[data-ending-style] {
    opacity: 0;
    transform: translateX(100%);
  }

  @media (width >= 800px) {
    gap: calc(12 * 100vw / 1440);
    padding: calc(12 * 100vw / 1440) calc(16 * 100vw / 1440);
    border-radius: calc(8 * 100vw / 1440);
  }

  ${({ $type }) => $type === 'success' && css`
    border-left: 4px solid #22c55e;
  `}

  ${({ $type }) => $type === 'error' && css`
    border-left: 4px solid #dc2626;
  `}

  ${({ $type }) => $type === 'info' && css`
    border-left: 4px solid #3b82f6;
  `}

  ${({ $type }) => ($type === 'default' || !$type) && css`
    border-left: 4px solid var(--color-contrast);
  `}
`

export const Title = styled(BaseToast.Title)`
  flex: 1;
  color: var(--color-secondary);
  font-weight: 500;
`

export const Description = styled(BaseToast.Description)`
  color: var(--color-secondary);
  opacity: 0.7;
  font-size: 0.875rem;
  margin-top: calc(4 * 100vw / 375);

  @media (width >= 800px) {
    margin-top: calc(4 * 100vw / 1440);
  }
`

export const Close = styled(BaseToast.Close)`
  background: transparent;
  border: none;
  color: var(--color-secondary);
  opacity: 0.5;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  padding: 0;
  transition: opacity 150ms ease;

  @media (hover: hover) {
    &:hover {
      opacity: 1;
    }
  }

  &:focus-visible {
    outline: 2px solid var(--color-contrast);
    outline-offset: 2px;
  }
`
