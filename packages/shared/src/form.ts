import { z } from 'zod'

/**
 * Dynamic form engine contract. A form's `schema` (JSONB `forms.schema`) is a
 * list of fields plus optional conditional-visibility rules. @atlas/forms renders
 * and validates against this; the same definition drives client and server
 * validation (ADR-0006).
 */

export const fieldTypeSchema = z.enum([
  'text',
  'email',
  'tel',
  'number',
  'textarea',
  'select',
  'multiselect',
  'checkbox',
  'radio',
  'date',
  'file',
  'hidden',
])
export type FieldType = z.infer<typeof fieldTypeSchema>

export const fieldOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
})

/** A visibility rule: show this field when another field's value matches. */
export const conditionSchema = z.object({
  field: z.string(),
  operator: z.enum(['eq', 'neq', 'in', 'notin', 'truthy', 'falsy']),
  value: z.union([z.string(), z.array(z.string()), z.boolean()]).optional(),
})
export type Condition = z.infer<typeof conditionSchema>

export const formFieldSchema = z.object({
  name: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9_]+$/, 'field name must be alphanumeric/underscore'),
  type: fieldTypeSchema,
  label: z.string(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(fieldOptionSchema).default([]),
  /** Optional client+server validation constraints. */
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      minLength: z.number().int().optional(),
      maxLength: z.number().int().optional(),
      pattern: z.string().optional(),
      accept: z.string().optional(), // file mime filter
    })
    .default({}),
  /** Show this field only when the condition holds. */
  visibleWhen: conditionSchema.optional(),
})
export type FormField = z.infer<typeof formFieldSchema>

export const formSettingsSchema = z.object({
  submitLabel: z.string().default('Submit'),
  successMessage: z.string().default('Thanks — we received your submission.'),
  successRedirect: z.string().url().optional(),
  /** Honeypot field name for spam protection. */
  honeypot: z.string().default('_hp'),
  notifyEmails: z.array(z.string().email()).default([]),
  webhookUrl: z.string().url().optional(),
})
export type FormSettings = z.infer<typeof formSettingsSchema>

export const formSchemaSchema = z.object({
  fields: z.array(formFieldSchema),
})

export const formDefinitionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  key: z.string().min(1),
  name: z.string().min(1),
  schema: formSchemaSchema,
  settings: formSettingsSchema,
})
export type FormDefinition = z.infer<typeof formDefinitionSchema>
