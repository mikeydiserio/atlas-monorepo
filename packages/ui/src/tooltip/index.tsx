'use client'

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import {
  type ComponentProps,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react'
import * as S from './tooltip.styles'

/**
 * Tooltip component built on Base UI for accessible hover hints.
 *
 * @example
 * ```tsx
 * <Tooltip content="This is helpful information">
 *   <button>Hover me</button>
 * </Tooltip>
 * ```
 *
 * @example
 * ```tsx
 * // With custom placement
 * <Tooltip content="Settings" side="right">
 *   <IconButton icon={<SettingsIcon />} />
 * </Tooltip>
 * ```
 */

type TooltipProps = {
  /** Content to display in the tooltip */
  content: ReactNode
  /** The trigger element (must be a single element that accepts ref) */
  children: ReactNode
  /** Side of the trigger to place the tooltip */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** Additional class for the popup */
  className?: string
}

function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  return (
    <BaseTooltip.Provider>
      <BaseTooltip.Root>
        <BaseTooltip.Trigger
          render={
            isValidElement(children) ? (
              (children as ReactElement)
            ) : (
              <span>{children}</span>
            )
          }
        />
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner side={side} sideOffset={8}>
            <S.Popup className={className}>
              <S.Arrow />
              {content}
            </S.Popup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  )
}

// Compound components for advanced usage
const Provider = BaseTooltip.Provider
const Root = BaseTooltip.Root
const Trigger = BaseTooltip.Trigger
const Portal = BaseTooltip.Portal

function Positioner({
  className,
  sideOffset = 8,
  ...props
}: ComponentProps<typeof BaseTooltip.Positioner>) {
  return (
    <BaseTooltip.Positioner
      className={className}
      sideOffset={sideOffset}
      {...props}
    />
  )
}

function Popup({
  className,
  ...props
}: ComponentProps<typeof BaseTooltip.Popup>) {
  return <S.Popup className={className} {...props} />
}

function Arrow({
  className,
  ...props
}: ComponentProps<typeof BaseTooltip.Arrow>) {
  return <S.Arrow className={className} {...props} />
}

// Attach compound components
Tooltip.Provider = Provider
Tooltip.Root = Root
Tooltip.Trigger = Trigger
Tooltip.Portal = Portal
Tooltip.Positioner = Positioner
Tooltip.Popup = Popup
Tooltip.Arrow = Arrow

export { Tooltip }
