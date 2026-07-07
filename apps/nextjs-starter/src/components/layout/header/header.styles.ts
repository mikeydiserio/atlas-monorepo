import styled, { css } from 'styled-components'
import { Link } from '@/components/ui/link'

export const Header = styled.header`
  position: fixed;
  top: var(--safe);
  left: var(--safe);
  z-index: 20;
  font-family: var(--next-font-mono);
  font-size: calc((10 * 100) / var(--device-width) * 1vw);
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @media (width >= 800px) {
    font-size: calc((11 * 100) / var(--device-width) * 1vw);
  }
`

export const Brand = styled.div`
  font-size: calc((12 * 100) / var(--device-width) * 1vw);
  margin-bottom: calc((6 * 100) / var(--device-width) * 1vw);
  display: flex;
  align-items: baseline;
  gap: 0.15em;

  @media (width >= 800px) {
    font-size: calc((13 * 100) / var(--device-width) * 1vw);
  }
`

export const BrandPath = styled.span`
  opacity: 0.45;
  max-width: 12ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const MenuToggle = styled.button`
  display: none;
  align-items: center;
  gap: 0.4em;
  background: none;
  border: none;
  color: inherit;
  font: inherit;
  text-transform: inherit;
  letter-spacing: inherit;
  cursor: pointer;
  padding: 0;
  min-height: 44px;
  min-width: 44px;

  @media (width <= 799.98px) {
    display: flex;
  }
`

export const NavList = styled.ul<{ $open?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;

  @media (width <= 799.98px) {
    display: none;
    margin-top: calc((4 * 100) / var(--device-width) * 1vw);
  }

  ${({ $open }) =>
    $open &&
    css`
      @media (width <= 799.98px) {
        display: flex;
      }
    `}
`

export const NavItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.3em;

  @media (width <= 799.98px) {
    min-height: 44px;
  }
`

export const Chevron = styled.span<{ $active?: boolean }>`
  width: 0.75em;
  flex-shrink: 0;
  color: var(--color-contrast);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out-expo);

  ${({ $active }) =>
    $active &&
    css`
      opacity: 1;
    `}
`

export const NavLink = styled(Link)<{ $active?: boolean; $dim?: boolean }>`
  transition:
    color var(--duration-fast) var(--ease-out-expo),
    opacity var(--duration-fast) var(--ease-out-expo);

  @media (hover: hover) {
    &:hover {
      color: var(--color-contrast);
      text-decoration: none;
      opacity: 1;
    }
  }

  ${({ $active }) =>
    $active &&
    css`
      opacity: 1;
    `}

  ${({ $dim }) =>
    $dim &&
    css`
      opacity: 0.4;
    `}
`
