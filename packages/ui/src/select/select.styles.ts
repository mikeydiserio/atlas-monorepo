import { Select as BaseSelect } from '@base-ui/react/select'
import styled from 'styled-components'

export const Label = styled.span`
  display: block;
  margin-bottom: calc(4 * 100vw / 375);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-secondary);

  @media (width >= 800px) {
    margin-bottom: calc(4 * 100vw / 1440);
  }
`

export const Trigger = styled(BaseSelect.Trigger)`
  box-shadow: 0 1px 2px rgba(0 0 0 / 0.1);
  display: flex;
  align-items: center;
  background-color: var(--color-primary);
  color: var(--color-secondary);
  cursor: pointer;
  transition: border-color 150ms ease;

  &:hover {
    border-color: var(--color-contrast);
  }

  &:focus-visible {
    outline: 2px solid var(--color-contrast);
    outline-offset: 2px;
  }

  &[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const Popup = styled(BaseSelect.Popup)`
  background-color: var(--color-primary);
  border: 1px solid var(--color-secondary);
  border-radius: calc(4 * 100vw / 375);
  padding: calc(4 * 100vw / 375);
  box-shadow: 0 4px 12px rgba(0 0 0 / 0.15);
  outline: none;
  z-index: 50;
  max-height: 300px;
  overflow-y: auto;
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
    border-radius: calc(4 * 100vw / 1440);
    padding: calc(4 * 100vw / 1440);
  }
`

export const Item = styled(BaseSelect.Item)`
  min-width: var(--anchor-width);
  cursor: default;
  grid-template-columns: 0.75rem 1fr;
  outline: none;
  border-radius: calc(2 * 100vw / 375);
  color: var(--color-secondary);

  @media (width >= 800px) {
    border-radius: calc(2 * 100vw / 1440);
  }

  &[data-side="none"] {
    min-width: calc(var(--anchor-width) + 1rem);
    padding-right: 1rem;
  }

  &[data-highlighted] {
    background-color: var(--color-contrast);
    color: var(--color-primary);
  }

  &[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`
