import styled, { css } from 'styled-components'

export const Fold = styled.div<{
  $disabled?: boolean
  $type?: 'bottom' | 'top'
  $overlay?: boolean
  $parallax?: boolean
}>`
  ${({ $disabled, $type, $overlay, $parallax }) =>
    !$disabled &&
    css`
      position: relative;

      ${$overlay &&
      css`
        .overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-color: var(--color-primary);
          opacity: var(--progress, 0);
        }
      `}

      .sticky {
        min-height: 100svh;
        position: sticky;
      }

      ${$parallax &&
      $type === 'bottom' &&
      css`
        .sticky {
          transform: translate3d(0, calc(-5svh * var(--progress, 0)), 0);
        }
      `}

      ${$parallax &&
      $type === 'top' &&
      css`
        .sticky {
          transform: translate3d(0, calc(5svh * var(--progress, 0)), 0);
        }
      `}

      ${$type === 'bottom' &&
      css`
        margin-bottom: -100svh;
        &::before {
          content: '';
          display: block;
          min-height: 100svh;
          visibility: hidden;
        }
        .sticky {
          bottom: 0;
        }
      `}

      ${$type === 'top' &&
      css`
        margin-top: -100svh;
        &::after {
          content: '';
          display: block;
          min-height: 100svh;
          visibility: hidden;
        }
        .sticky {
          top: 0;
        }
      `}
    `}
`
