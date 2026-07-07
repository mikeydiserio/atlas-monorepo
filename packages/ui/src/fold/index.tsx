'use client'

import { useRect, useScrollTrigger, useWindowSize } from 'hamo'
import {
  createContext,
  type HTMLAttributes,
  type ReactNode,
  use,
  useRef,
} from 'react'
import * as S from './fold.styles'

const FoldContext = createContext(false)

export function useFold() {
  return use(FoldContext)
}

type FoldProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode
  className?: string
  type?: 'bottom' | 'top'
  disabled?: boolean
  overlay?: boolean
  parallax?: boolean
}

export function Fold({
  children,
  className,
  disabled = false,
  type = 'bottom',
  overlay = true,
  parallax = true,
  ...props
}: FoldProps) {
  const foldRef = useRef<HTMLDivElement | null>(null)
  const { height: windowHeight = 0 } = useWindowSize()
  const [setRectRef, rect] = useRect()

  const overlayRef = useRef<HTMLDivElement>(null!)
  const stickyRef = useRef<HTMLDivElement>(null!)

  useScrollTrigger({
    start: `${rect.top ?? 0} top`,
    end: `${(rect.top ?? 0) + windowHeight} top`,
    disabled: disabled || type === 'bottom',
    onProgress: ({ progress }) => {
      if (overlayRef.current) {
        overlayRef.current.style.setProperty('--progress', String(1 - progress))
      }

      if (stickyRef.current) {
        stickyRef.current.style.setProperty('--progress', String(1 - progress))
      }
    },
  })

  useScrollTrigger({
    start: `${(rect.bottom ?? 0) - windowHeight} bottom`,
    end: `${rect.bottom ?? 0} bottom`,
    disabled: disabled || type === 'top',
    onProgress: ({ progress }) => {
      if (overlayRef.current) {
        overlayRef.current.style.setProperty('--progress', String(progress))
      }

      if (stickyRef.current) {
        stickyRef.current.style.setProperty('--progress', String(progress))
      }
    },
  })

  return (
    <FoldContext.Provider value={true}>
      <S.Fold
        ref={(node) => {
          foldRef.current = node
          setRectRef(node)
        }}
        $disabled={disabled}
        $type={type}
        $overlay={overlay}
        $parallax={parallax}
        className={className}
        {...props}
      >
        <div className="sticky" ref={stickyRef}>
          {children}
        </div>
        <div className="overlay" ref={overlayRef} />
      </S.Fold>
    </FoldContext.Provider>
  )
}
