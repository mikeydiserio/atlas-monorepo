'use client'

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import type { ComponentProps } from 'react'
import * as S from './checkbox.styles'

/**
 * Checkbox component built on Base UI for accessible checkboxes.
 *
 * @example
 * ```tsx
 * <Checkbox label="Accept terms and conditions" />
 * ```
 *
 * @example
 * ```tsx
 * // Controlled
 * const [agreed, setAgreed] = useState(false)
 *
 * <Checkbox
 *   checked={agreed}
 *   onCheckedChange={setAgreed}
 *   label="I agree"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Indeterminate state
 * <Checkbox
 *   checked="indeterminate"
 *   label="Select all"
 * />
 * ```
 */

type CheckboxProps = Omit<
  ComponentProps<typeof BaseCheckbox.Root>,
  'children'
> & {
  /** Label for the checkbox */
  label?: string
  /** Additional class for the checkbox */
  className?: string
  /** Additional class for the label */
  labelClassName?: string
}

function Checkbox({
  label,
  className,
  labelClassName,
  ...props
}: CheckboxProps) {
  if (!label) {
    return (
      <S.Root className={className} {...props}>
        <S.Indicator>
          <CheckIcon />
        </S.Indicator>
      </S.Root>
    )
  }

  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: Base UI checkbox is wrapped in label for accessibility
    <S.Container className={labelClassName}>
      <S.Root className={className} {...props}>
        <S.Indicator>
          <CheckIcon />
        </S.Indicator>
      </S.Root>
      <S.Label>{label}</S.Label>
    </S.Container>
  )
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 6L5 8.5L9.5 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Compound components
function Root({
  className,
  ...props
}: ComponentProps<typeof BaseCheckbox.Root>) {
  return <S.Root className={className} {...props} />
}

function Indicator({
  className,
  children,
  ...props
}: ComponentProps<typeof BaseCheckbox.Indicator>) {
  return (
    <S.Indicator className={className} {...props}>
      {children ?? <CheckIcon />}
    </S.Indicator>
  )
}

Checkbox.Root = Root
Checkbox.Indicator = Indicator

export { Checkbox }
