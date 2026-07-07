'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import * as S from './header.styles'

type NavLink = { href: string; label: string; external?: boolean }

// Navigation links - customize for your project
const LINKS: NavLink[] = [
  { href: '/', label: 'home' },
  ]

export function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <S.Header>
      {/* Brand: logo + live pathname */}
      <S.Brand>
        <span>Layoutory</span>
        <S.BrandPath>{pathname}</S.BrandPath>
      </S.Brand>

      {/* Mobile menu toggle */}
      <S.MenuToggle
        aria-expanded={menuOpen}
        aria-controls="header-nav"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setMenuOpen((prev) => !prev)}
        type="button"
      >
        {menuOpen ? '✕ close' : '≡ menu'}
      </S.MenuToggle>

      {/* Level 1: Main navigation */}
      <S.NavList $open={menuOpen} id="header-nav">
        {LINKS.map((link) => {
          const isExternal = 'external' in link && link.external
          const isActive = pathname === link.href

          return (
            <S.NavItem key={link.href}>
              <S.Chevron $active={isActive}>›</S.Chevron>
              <S.NavLink
                $active={isActive}
                $dim={!isActive}
                href={link.href}
                {...(isExternal && {
                  target: '_blank',
                  rel: 'noopener noreferrer',
                })}
              >
                {link.label}
                {isExternal && '↗'}
              </S.NavLink>
            </S.NavItem>
          )
        })}
      </S.NavList>
    </S.Header>
  )
}
