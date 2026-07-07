'use client'

import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import {
  StyledButton,
  StyledCard,
  StyledHeading,
  StyledStack,
  StyledText,
  type ButtonVariant,
} from './primitives.styles'

/**
 * Public primitive components. Thin wrappers that map clean public props onto
 * `$`-transient styled props (Satūs convention) so consumers never touch
 * styled-components internals.
 */

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export function Button({ variant = 'primary', type = 'button', ...props }: ButtonProps) {
  return <StyledButton $variant={variant} type={type} {...props} />
}

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3
}

export function Heading({ level = 2, ...props }: HeadingProps) {
  return <StyledHeading as={`h${level}`} $level={level} {...props} />
}

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  muted?: boolean
}

export function Text({ muted, ...props }: TextProps) {
  return <StyledText $muted={muted} {...props} />
}

export function Card(props: HTMLAttributes<HTMLDivElement>) {
  return <StyledCard {...props} />
}

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /** Theme space key ('sm' | 'md' | …) or a CSS length. */
  gap?: string
  horizontal?: boolean
  children?: ReactNode
}

export function Stack({ gap, horizontal, ...props }: StackProps) {
  return <StyledStack $gap={gap} $horizontal={horizontal} {...props} />
}
