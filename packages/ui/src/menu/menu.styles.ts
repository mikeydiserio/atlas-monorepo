import { Menu as BaseMenu } from '@base-ui/react/menu'
import styled from 'styled-components'

export const Trigger = styled(BaseMenu.Trigger)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(8 * 100vw / 375);
  padding: calc(8 * 100vw / 375) calc(12 * 100vw / 375);
  border-radius: calc(2 * 100vw / 375);
  border: 1px solid currentColor;
  background-color: var(--color-primary);
  color: var(--color-secondary);
  cursor: pointer;

  @media (width >= 800px) {
    gap: calc(8 * 100vw / 1440);
    padding: calc(8 * 100vw / 1440) calc(12 * 100vw / 1440);
    border-radius: calc(2 * 100vw / 1440);
  }
`

export const Popup = styled(BaseMenu.Popup)`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-width: var(--anchor-width);
  background-color: var(--color-primary);
  border: 1px solid var(--color-secondary);
  border-radius: calc(2 * 100vw / 375);
  overflow: clip;
  padding: calc(4 * 100vw / 375);
  outline: none;
  z-index: 50;
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
    border-radius: calc(2 * 100vw / 1440);
    padding: calc(4 * 100vw / 1440);
  }
`

export const Item = styled(BaseMenu.Item)`
  color: var(--color-secondary);
  padding: calc(8 * 100vw / 375) calc(12 * 100vw / 375);
  position: relative;
  text-align: left;
  white-space: nowrap;
  display: block;
  width: 100%;
  border-radius: calc(2 * 100vw / 375);
  cursor: pointer;
  outline: none;
  background: transparent;
  border: none;

  @media (width >= 800px) {
    padding: calc(8 * 100vw / 1440) calc(12 * 100vw / 1440);
    border-radius: calc(2 * 100vw / 1440);
  }

  @media (hover: hover) {
    &:hover,
    &[data-highlighted] {
      background-color: var(--color-contrast);
      color: var(--color-primary);
    }
  }

  &:focus-visible {
    background-color: var(--color-contrast);
    color: var(--color-primary);
  }

  &[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const Separator = styled.hr`
  height: 1px;
  border: none;
  background-color: var(--color-secondary);
  opacity: 0.2;
  margin: calc(4 * 100vw / 375) 0;

  @media (width >= 800px) {
    margin: calc(4 * 100vw / 1440) 0;
  }
`

export const Arrow = styled.span`
  transition: transform 150ms ease-out;

  [data-open] & {
    transform: rotate(180deg);
  }
`
