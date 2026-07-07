'use client'

import { Switch as BaseSwitch } from '@base-ui/react/switch'
import type { ComponentProps } from 'react'
import * as S from './switch.styles'

/**
 * Switch component built on Base UI for accessible toggle switches.
 *
 * @example
 * ```tsx
 * <Switch label="Enable notifications" />
 * ```
 *
 * @example
 * ```tsx
 * // Controlled
 * const [enabled, setEnabled] = useState(false)
 *
 * <Switch
 *   checked={enabled}
 *   onCheckedChange={setEnabled}
 *   label="Dark mode"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Compound pattern
 * <Switch.Root checked={on} onCheckedChange={setOn}>
 *   <Switch.Thumb />
 * </Switch.Root>
 * ```
 */

type SwitchProps = Omit<ComponentProps<typeof BaseSwitch.Root>, 'children'> & {
  /** Label for the switch */
  label?: string
  /** Additional class for the switch */
  className?: string
  /** Additional class for the label */
  labelClassName?: string
}

function Switch({ label, className, labelClassName, ...props }: SwitchProps) {
  if (!label) {
    return (
      <S.Root className={className} {...props}>
        <S.Thumb />
      </S.Root>
    )
  }

  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: Base UI switch is wrapped in label for accessibility
    <S.Container className={labelClassName}>
      <S.Root className={className} {...props}>
        <S.Thumb />
      </S.Root>
      <S.Label>{label}</S.Label>
    </S.Container>
  )
}

// Compound components
function Root({ className, ...props }: ComponentProps<typeof BaseSwitch.Root>) {
  return <S.Root className={className} {...props} />
}

function Thumb({
  className,
  ...props
}: ComponentProps<typeof BaseSwitch.Thumb>) {
  return <S.Thumb className={className} {...props} />
}

Switch.Root = Root
Switch.Thumb = Thumb

export { Switch }
