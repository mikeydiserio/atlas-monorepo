'use client'

import styled, { css } from 'styled-components'

/**
 * Themed primitive styles. Satūs conventions: styled-components with
 * `$`-transient props; every value comes from the AtlasTheme — no hard-coded
 * presentation anywhere. Two tenants render these identically in structure and
 * entirely differently in look.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const buttonVariants = {
  primary: css`
    background: ${({ theme }) => theme.color.accent};
    color: ${({ theme }) => theme.color.background};
    border: 1px solid transparent;
  `,
  secondary: css`
    background: transparent;
    color: ${({ theme }) => theme.color.foreground};
    border: 1px solid ${({ theme }) => theme.color.border};
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.color.accent};
    border: 1px solid transparent;
  `,
} as const

export const StyledButton = styled.button<{ $variant?: ButtonVariant }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space.sm};
  padding: ${({ theme }) => `${theme.space.sm} ${theme.space.md}`};
  min-height: 44px; /* touch target */
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  transition: opacity 150ms ease, transform 150ms ease;

  ${({ $variant = 'primary' }) => buttonVariants[$variant]}

  &:hover {
    opacity: 0.85;
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.accent};
    outline-offset: 2px;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const StyledHeading = styled.h2<{ $level?: 1 | 2 | 3 }>`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  color: ${({ theme }) => theme.color.foreground};
  font-size: ${({ theme, $level = 2 }) =>
    theme.typography.fontSize[$level === 1 ? '2xl' : $level === 2 ? 'xl' : 'lg']};
  text-wrap: balance;
  margin: 0;
`

export const StyledText = styled.p<{ $muted?: boolean | undefined }>`
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  color: ${({ theme, $muted }) => ($muted ? theme.color.muted : theme.color.foreground)};
  text-wrap: pretty;
  margin: 0;
`

export const StyledCard = styled.div`
  background: ${({ theme }) => theme.color.background};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  padding: ${({ theme }) => theme.space.lg};
`

export const StyledStack = styled.div<{ $gap?: string | undefined; $horizontal?: boolean | undefined }>`
  display: flex;
  flex-direction: ${({ $horizontal }) => ($horizontal ? 'row' : 'column')};
  gap: ${({ theme, $gap }) => ($gap ? (theme.space[$gap] ?? $gap) : theme.space.md)};
`
