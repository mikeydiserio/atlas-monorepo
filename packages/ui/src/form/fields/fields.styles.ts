import { Field } from '@base-ui/react/field'
import styled, { css } from 'styled-components'

export const FieldRoot = styled(Field.Root)<{ $active?: boolean; $error?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: calc(4 * 100vw / 375);

  @media (width >= 800px) {
    gap: calc(4 * 100vw / 1440);
  }
`

export const CheckboxGroup = styled(Field.Root)`
  display: flex;
  flex-direction: column;
  gap: calc(8 * 100vw / 375);

  @media (width >= 800px) {
    gap: calc(8 * 100vw / 1440);
  }
`

export const Label = styled(Field.Label)<{ $active?: boolean }>`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ $active }) =>
    $active ? 'var(--color-contrast)' : 'var(--color-secondary)'};
  transition: color 150ms ease;
`

export const Input = styled(Field.Control)<{ $hasError?: boolean }>`
  padding: calc(10 * 100vw / 375) calc(12 * 100vw / 375);
  border: 1px solid
    ${({ $hasError }) =>
      $hasError ? '#dc2626' : 'var(--color-secondary)'};
  border-radius: calc(4 * 100vw / 375);
  background-color: transparent;
  color: var(--color-secondary);
  font-size: inherit;
  font-family: inherit;
  transition: border-color 150ms ease;
  width: 100%;

  @media (width >= 800px) {
    padding: calc(10 * 100vw / 1440) calc(12 * 100vw / 1440);
    border-radius: calc(4 * 100vw / 1440);
  }

  &::placeholder {
    color: var(--color-secondary);
    opacity: 0.5;
  }

  &:focus {
    outline: none;
    border-color: var(--color-contrast);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const TextareaStyled = styled.textarea<{ $hasError?: boolean }>`
  padding: calc(10 * 100vw / 375) calc(12 * 100vw / 375);
  border: 1px solid
    ${({ $hasError }) =>
      $hasError ? '#dc2626' : 'var(--color-secondary)'};
  border-radius: calc(4 * 100vw / 375);
  background-color: transparent;
  color: var(--color-secondary);
  font-size: inherit;
  font-family: inherit;
  transition: border-color 150ms ease;
  width: 100%;
  resize: vertical;
  min-height: 100px;

  @media (width >= 800px) {
    padding: calc(10 * 100vw / 1440) calc(12 * 100vw / 1440);
    border-radius: calc(4 * 100vw / 1440);
  }

  &::placeholder {
    color: var(--color-secondary);
    opacity: 0.5;
  }

  &:focus {
    outline: none;
    border-color: var(--color-contrast);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const ErrorMessage = styled(Field.Error)`
  font-size: 0.75rem;
  color: #dc2626;
  margin-top: calc(2 * 100vw / 375);

  @media (width >= 800px) {
    margin-top: calc(2 * 100vw / 1440);
  }
`

export const GroupLabel = styled(Field.Label)`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-secondary);
`

export const Options = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: calc(8 * 100vw / 375);

  @media (width >= 800px) {
    gap: calc(8 * 100vw / 1440);
  }
`

export const Option = styled.button<{ $selected?: boolean }>`
  padding: calc(6 * 100vw / 375) calc(12 * 100vw / 375);
  border: 1px solid var(--color-secondary);
  border-radius: calc(4 * 100vw / 375);
  background-color: transparent;
  color: var(--color-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    color 150ms ease,
    border-color 150ms ease;

  @media (width >= 800px) {
    padding: calc(6 * 100vw / 1440) calc(12 * 100vw / 1440);
    border-radius: calc(4 * 100vw / 1440);
  }

  @media (hover: hover) {
    &:hover {
      border-color: var(--color-contrast);
    }
  }

  ${({ $selected }) =>
    $selected &&
    css`
      background-color: var(--color-contrast);
      border-color: var(--color-contrast);
      color: var(--color-primary);
    `}
`
