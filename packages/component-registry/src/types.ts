import type { ReactNode } from 'react'
import type { z } from 'zod'

/**
 * Component contracts (ADR-0005/0006). A component is an independent React
 * component that never knows about page layouts. Everything the platform needs
 * — palette entry, prop validation, field editors, versioning — derives from
 * this definition.
 */

export type ComponentCategory =
  | 'content'
  | 'media'
  | 'marketing'
  | 'navigation'
  | 'social'
  | 'module'

/** How the editor should render one prop's field editor. Derived from the Zod
 * schema by default; authors may override per field. */
export type FieldControl =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'boolean'
  | 'select'
  | 'url'
  | 'image'
  | 'color'
  | 'list'
  | 'group'

export interface EditableFieldSpec {
  /** Prop name. */
  name: string
  label: string
  control: FieldControl
  required: boolean
  help?: string
  /** For 'select'. */
  options?: Array<{ label: string; value: string }>
  /** Editor grouping tab, e.g. 'Content' | 'Appearance'. */
  group?: string
  /** Supports inline editing directly on the rendered page (Stage 6). */
  inline?: boolean
}

/**
 * A migration transforms props authored against `fromVersion` to
 * `fromVersion + 1`. Chains run stepwise, so a v1 instance still renders after
 * the component ships v3.
 */
export type PropsMigration = (props: Record<string, unknown>) => Record<string, unknown>

export interface ComponentDefinition<TProps = Record<string, unknown>> {
  /** Registry key, e.g. 'hero'. Stable forever once published. */
  id: string
  name: string
  /** Icon name (lucide key) for the editor palette. */
  icon: string
  category: ComponentCategory
  /** Current schema version. ComponentNode.version records what an instance was authored against. */
  version: number
  /** Source of truth for props (ADR-0006): validation + field derivation. */
  schema: z.ZodType<TProps>
  defaultProps: TProps
  /** Per-field editor overrides, merged over the schema-derived defaults. */
  fields?: Record<string, Partial<Omit<EditableFieldSpec, 'name'>>>
  /** Keyed by fromVersion: migrations[1] upgrades v1 props to v2. */
  migrations?: Record<number, PropsMigration>
  /** Pure render of validated props. No layout knowledge, no registry access. */
  render: (props: TProps) => ReactNode
  /** Editor palette description. */
  description?: string
}

/** Identity helper for full inference without casts. */
export function defineComponent<TProps>(def: ComponentDefinition<TProps>): ComponentDefinition<TProps> {
  return def
}
