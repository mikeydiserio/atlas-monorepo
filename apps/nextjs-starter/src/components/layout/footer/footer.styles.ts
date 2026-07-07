import styled from 'styled-components'
import { Link } from '@/components/ui/link'

export const Footer = styled.footer`
  padding: var(--safe);
  padding-top: calc(var(--safe) * 1.5);
  padding-bottom: calc(var(--safe) * 1.5);
  font-family: var(--next-font-mono);
  font-size: calc((10 * 100) / var(--device-width) * 1vw);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc((16 * 100) / var(--device-width) * 1vw);

  @media (width >= 800px) {
    font-size: calc((11 * 100) / var(--device-width) * 1vw);
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
`

export const LogoLink = styled(Link)`
  transition: opacity var(--duration-fast) var(--ease-out-expo);

  @media (hover: hover) {
    &:hover {
      opacity: 0.65;
    }
  }
`

export const Links = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6em;
`

export const Separator = styled.span`
  opacity: 0.3;
`

export const StyledLink = styled(Link)`
  transition: color var(--duration-fast) var(--ease-out-expo);

  @media (hover: hover) {
    &:hover {
      color: var(--color-contrast);
      text-decoration: none;
    }
  }
`
