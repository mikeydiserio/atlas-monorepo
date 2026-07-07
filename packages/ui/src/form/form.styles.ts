import styled, { css } from 'styled-components'

export const SubmitButton = styled.button<{
  $disabled?: boolean
  $pending?: boolean
  $submitted?: boolean
  $error?: boolean
}>`
  position: relative;
  background-color: var(--color-secondary);
  color: var(--color-primary);
  display: flex;
  justify-content: center;
  align-items: center;

  ${({ $disabled }) =>
    $disabled &&
    css`
      pointer-events: none;
      background-color: var(--color-secondary);
      color: rgba(0, 0, 0, 0.25);
      opacity: 0.5;
    `}

  ${({ $submitted }) =>
    $submitted &&
    css`
      pointer-events: none;
      background: var(--color-green);
    `}

  ${({ $error }) =>
    $error &&
    css`
      pointer-events: none;
      background: var(--color-white);
    `}

  ${({ $pending }) =>
    $pending &&
    css`
      pointer-events: none;
      opacity: 0.7;
    `}

  span {
    position: relative;
    text-align: center;
  }

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    background-color: var(--color-black);
    clip-path: circle(0%);
  }

  @media (hover: hover) {
    &:hover {
      color: var(--color-white);

      &::before {
        transition: 1000ms clip-path var(--ease-gleasing);
        clip-path: circle(100%);
      }
    }
  }
`

export const Messages = styled.div`
  display: flex;
  flex-direction: column;
  font-size: calc(8 * 100vw / 375);
  padding-right: calc(16 * 100vw / 375);

  @media (width >= 800px) {
    font-size: calc(14 * 100vw / 1440);
    padding-right: calc(16 * 100vw / 1440);
  }

  p {
    color: var(--color-white);
  }
`
