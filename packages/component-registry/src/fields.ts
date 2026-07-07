import { z } from 'zod'
import type { ComponentDefinition, EditableFieldSpec, FieldControl } from './types'

/**
 * Schema-driven field derivation (ADR-0006). The editor's property panel is
 * generated from the component's Zod schema — prop shapes are declared exactly
 * once. Authors refine presentation (control, label, grouping) via
 * `definition.fields`, but never re-declare types.
 */

function titleCase(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/^./, (c) => c.toUpperCase())
}

interface Unwrapped {
  type: z.ZodType
  required: boolean
}

/** Peel optional/nullable/default wrappers to find the base type. */
function unwrap(type: z.ZodType): Unwrapped {
  let current = type
  let required = true
  // Bounded loop: wrapper nesting is always shallow in practice.
  for (let i = 0; i < 8; i++) {
    if (current instanceof z.ZodOptional || current instanceof z.ZodNullable) {
      required = false
      current = current.unwrap() as z.ZodType
    } else if (current instanceof z.ZodDefault) {
      required = false
      current = current.def.innerType as z.ZodType
    } else {
      break
    }
  }
  return { type: current, required }
}

function controlFor(type: z.ZodType): Pick<EditableFieldSpec, 'control' | 'options'> {
  if (type instanceof z.ZodEnum) {
    const values = type.options as readonly string[]
    return {
      control: 'select',
      options: values.map((value) => ({ label: titleCase(String(value)), value: String(value) })),
    }
  }
  if (type instanceof z.ZodString) return { control: 'text' }
  if (type instanceof z.ZodNumber) return { control: 'number' }
  if (type instanceof z.ZodBoolean) return { control: 'boolean' }
  if (type instanceof z.ZodArray) return { control: 'list' }
  if (type instanceof z.ZodObject) return { control: 'group' }
  return { control: 'text' }
}

/**
 * Derive the editable-field specs for a component. Only object schemas are
 * derivable; non-object schemas yield no fields (the component then has no
 * editable props, which is legitimate).
 */
export function deriveEditableFields(def: ComponentDefinition<never> | ComponentDefinition): EditableFieldSpec[] {
  const schema: unknown = def.schema
  if (!(schema instanceof z.ZodObject)) return []

  const specs: EditableFieldSpec[] = []
  for (const [name, raw] of Object.entries(schema.shape as Record<string, z.ZodType>)) {
    const { type, required } = unwrap(raw)
    const base = controlFor(type)
    const override = def.fields?.[name] ?? {}
    const spec: EditableFieldSpec = {
      name,
      label: override.label ?? titleCase(name),
      control: (override.control as FieldControl | undefined) ?? base.control,
      required: override.required ?? required,
      ...(base.options || override.options
        ? { options: override.options ?? base.options }
        : {}),
      ...(override.help ?? raw.description ? { help: override.help ?? raw.description } : {}),
      ...(override.group ? { group: override.group } : {}),
      ...(override.inline !== undefined ? { inline: override.inline } : {}),
    }
    specs.push(spec)
  }
  return specs
}
