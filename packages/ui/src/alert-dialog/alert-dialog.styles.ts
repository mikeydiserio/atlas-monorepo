import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog'
import styled, { css } from 'styled-components'

export const Backdrop = styled(BaseAlertDialog.Backdrop)`
  position: fixed;
  inset: 0;
  background-color: rgba(0 0 0 / 0.5);
  z-index: 100;
  backdrop-filter: blur(2px);
  transition: opacity 150ms ease-out;
  opacity: 1;

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
  }
`

export const Popup = styled(BaseAlertDialog.Popup)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 101;
  background-color: var(--color-primary);
  border: 1px solid var(--color-secondary);
  border-radius: calc(8 * 100vw / 375);
  padding: calc(24 * 100vw / 375);
  max-width: min(400px, 90vw);
  width: 100%;
  box-shadow: 0 8px 32px rgba(0 0 0 / 0.2);
  transition:
    transform 150ms ease-out,
    opacity 150ms ease-out;
  opacity: 1;

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }

  @media (width >= 800px) {
    border-radius: calc(8 * 100vw / 1440);
    padding: calc(24 * 100vw / 1440);
  }
`

export const Title = styled(BaseAlertDialog.Title)`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-secondary);
  margin: 0 0 calc(8 * 100vw / 375);

  @media (width >= 800px) {
    margin: 0 0 calc(8 * 100vw / 1440);
  }
`

export const Description = styled(BaseAlertDialog.Description)`
  color: var(--color-secondary);
  opacity: 0.7;
  margin: 0 0 calc(20 * 100vw / 375);
  line-height: 1.5;

  @media (width >= 800px) {
    margin: 0 0 calc(20 * 100vw / 1440);
  }
`

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: calc(8 * 100vw / 375);

  @media (width >= 800px) {
    gap: calc(8 * 100vw / 1440);
  }
`

export const Cancel = styled(BaseAlertDialog.Close)`
  padding: calc(8 * 100vw / 375) calc(16 * 100vw / 375);
  border-radius: calc(4 * 100vw / 375);
  font-size: inherit;
  font-family: inherit;
  cursor: pointer;
  border: none;
  transition:
    background-color 150ms ease,
    color 150ms ease;
  background-color: transparent;
  color: var(--color-secondary);
  border: 1px solid var(--color-secondary);

  @media (width >= 800px) {
    padding: calc(8 * 100vw / 1440) calc(16 * 100vw / 1440);
    border-radius: calc(4 * 100vw / 1440);
  }

  &:focus-visible {
    outline: 2px solid var(--color-contrast);
    outline-offset: 2px;
  }

  @media (hover: hover) {
    &:hover {
      background-color: var(--color-secondary);
      color: var(--color-primary);
    }
  }
`

export const Confirm = styled(BaseAlertDialog.Close)<{ $destructive?: boolean }>`
  padding: calc(8 * 100vw / 375) calc(16 * 100vw / 375);
  border-radius: calc(4 * 100vw / 375);
  font-size: inherit;
  font-family: inherit;
  cursor: pointer;
  border: none;
  background-color: var(--color-contrast);
  color: var(--color-primary);
  transition:
    background-color 150ms ease,
    color 150ms ease;

  @media (width >= 800px) {
    padding: calc(8 * 100vw / 1440) calc(16 * 100vw / 1440);
    border-radius: calc(4 * 100vw / 1440);
  }

  &:focus-visible {
    outline: 2px solid var(--color-contrast);
    outline-offset: 2px;
  }

  @media (hover: hover) {
    &:hover {
      opacity: 0.9;
    }
  }

  ${({ $destructive }) =>
    $destructive &&
    css`
      background-color: #dc2626;
    `}
`
