import { z } from 'zod'
import type { FormField, FormDefinition } from '@atlas/shared'
import { evaluateCondition } from './conditions'

/**
 * Schema → validator compilation (ADR-0006). The authored `FormSchema`
 * (JSONB `forms.schema`) compiles into Zod validators — the SAME compiled
 * validator runs in the browser (React Hook Form resolver) and on the server
 * (submission pipeline). Field types and constraints are declared once.
 */

function baseType(field: FormField): z.ZodType {
  const v = field.validation
  switch (field.type) {
    case 'email':
      return z.string().email()
    case 'number': {
      let n = z.coerce.number()
      if (v.min !== undefined) n = n.min(v.min)
      if (v.max !== undefined) n = n.max(v.max)
      return n
    }
    case 'checkbox':
      // HTML forms post 'on'/absent; JSON posts booleans.
      return z.union([z.boolean(), z.string()]).transform((x) => x === true || x === 'on' || x === 'true')
    case 'select':
    case 'radio': {
      const values = field.options.map((o) => o.value)
      return values.length > 0 ? z.enum(values as [string, ...string[]]) : z.string()
    }
    case 'multiselect': {
      const values = field.options.map((o) => o.value)
      const item = values.length > 0 ? z.enum(values as [string, ...string[]]) : z.string()
      return z.array(item)
    }
    case 'date':
      return z.string().refine((s) => !Number.isNaN(new Date(s).getTime()), 'invalid date')
    case 'file':
      // Server-side: the upload is referenced by storage path after the cms
      // layer stores it; validation here checks the reference.
      return z.string()
    case 'tel':
    case 'text':
    case 'textarea':
    case 'hidden':
    default: {
      let s = z.string()
      if (v.minLength !== undefined) s = s.min(v.minLength)
      if (v.maxLength !== undefined) s = s.max(v.maxLength)
      if (v.pattern !== undefined) s = s.regex(new RegExp(v.pattern))
      return s
    }
  }
}

export function fieldValidator(field: FormField): z.ZodType {
  const base = baseType(field)
  if (field.required) {
    // required strings must be non-empty, not merely present
    return field.type === 'text' || field.type === 'textarea' || field.type === 'tel' || field.type === 'hidden'
      ? (base as z.ZodString).min(1, `${field.label} is required`)
      : base
  }
  return base.optional().or(z.literal('').transform(() => undefined))
}

export interface FormValidationResult {
  ok: boolean
  /** Parsed values for VISIBLE fields only. */
  values: Record<string, unknown>
  /** Field name → messages. */
  issues: Record<string, string[]>
}

/**
 * Validate raw submission data against the authored schema. Hidden fields
 * (visibleWhen false) are skipped entirely — their values are discarded, never
 * validated, never persisted (a hidden required field must not block submit).
 */
export function validateSubmission(
  definition: Pick<FormDefinition, 'schema'>,
  data: Record<string, unknown>
): FormValidationResult {
  const values: Record<string, unknown> = {}
  const issues: Record<string, string[]> = {}

  for (const field of definition.schema.fields) {
    const visible = field.visibleWhen ? evaluateCondition(field.visibleWhen, data) : true
    if (!visible) continue

    const raw = data[field.name]
    if (raw === undefined && !field.required) continue

    const parsed = fieldValidator(field).safeParse(raw ?? (field.required ? '' : undefined))
    if (parsed.success) {
      if (parsed.data !== undefined) values[field.name] = parsed.data
    } else {
      issues[field.name] = parsed.error.issues.map((i) => i.message)
    }
  }

  return { ok: Object.keys(issues).length === 0, values, issues }
}
