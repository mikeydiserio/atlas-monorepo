'use client'

import { useState } from 'react'
import { useFormContext } from '..'
import * as S from './fields.styles'

/**
 * Form field components built on Base UI Field for accessibility.
 *
 * @example
 * ```tsx
 * <Form action={myAction}>
 *   <InputField
 *     id="email"
 *     type="email"
 *     label="Email address"
 *     placeholder="you@example.com"
 *     required
 *   />
 *   <TextareaField
 *     id="message"
 *     label="Message"
 *     rows={4}
 *   />
 *   <SubmitButton>Send</SubmitButton>
 * </Form>
 * ```
 */

type InputFieldProps = {
  className?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  id: string
  name?: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export function InputField({
  className,
  type = 'text',
  id,
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
}: InputFieldProps) {
  const { state, actions } = useFormContext()
  const { errors, isActive } = state
  const { register } = actions
  // Use name (or id as fallback) as the registration key — matches the input's name attribute
  const fieldName = name ?? id
  const error = errors[fieldName]

  return (
    <S.FieldRoot
      $active={!!isActive[fieldName]}
      $error={!!error?.state}
      className={className}
      disabled={disabled}
    >
      {label && (
        <S.Label htmlFor={id} $active={!!isActive[fieldName]}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </S.Label>
      )}
      <S.Input
        type={type}
        id={id}
        name={fieldName}
        required={required}
        placeholder={placeholder}
        $hasError={!!error?.state}
        {...register(fieldName)}
        render={<input />}
      />
      {error?.state && error.message && (
        <S.ErrorMessage>{error.message}</S.ErrorMessage>
      )}
    </S.FieldRoot>
  )
}

type TextareaFieldProps = {
  className?: string
  id: string
  name?: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  rows?: number
}

export function TextareaField({
  className,
  id,
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  rows = 4,
}: TextareaFieldProps) {
  const { state, actions } = useFormContext()
  const { errors, isActive } = state
  const { register } = actions
  const fieldName = name ?? id
  const error = errors[fieldName]
  const reg = register(fieldName)

  return (
    <S.FieldRoot
      $active={!!isActive[fieldName]}
      $error={!!error?.state}
      className={className}
      disabled={disabled}
    >
      {label && (
        <S.Label htmlFor={id} $active={!!isActive[fieldName]}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </S.Label>
      )}
      <S.TextareaStyled
        id={id}
        name={fieldName}
        required={required}
        placeholder={placeholder}
        rows={rows}
        $hasError={!!error?.state}
        {...reg}
      />
      {error?.state && error.message && (
        <S.ErrorMessage>{error.message}</S.ErrorMessage>
      )}
    </S.FieldRoot>
  )
}

type CheckboxesFieldProps = {
  className?: string
  options: { label: string; value: string }[]
  name?: string
  label?: string
}

export function CheckboxesField({
  className,
  options,
  name = 'interests',
  label = 'Select topics of interest',
}: CheckboxesFieldProps) {
  const { actions } = useFormContext()
  const { register } = actions
  const [selected, setSelected] = useState<string[]>(['all'])

  const handleToggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const reg = register(name)

  return (
    <S.CheckboxGroup className={className}>
      {label && <S.GroupLabel>{label}</S.GroupLabel>}
      <input
        type="hidden"
        name={name}
        id="hidden"
        value={JSON.stringify(selected)}
        {...reg}
      />
      <S.Options>
        {options.map(({ label, value }) => (
          <S.Option
            key={value}
            $selected={selected.includes(value)}
            type="button"
            onClick={() => handleToggle(value)}
          >
            <span>{label}</span>
          </S.Option>
        ))}
      </S.Options>
    </S.CheckboxGroup>
  )
}
