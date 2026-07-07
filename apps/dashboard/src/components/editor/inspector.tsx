'use client'

import {
  deriveEditableFields,
  getComponent,
  type ComponentDefinition,
  type EditableFieldSpec,
} from '@atlas/component-registry'
import { getLayout } from '@atlas/layout-engine'
import { findNode, isLayoutNode } from '@atlas/page-builder'
import type { LayoutNode } from '@atlas/shared'
import { Field } from './editor.styles'

/**
 * Inspector: property panel generated from schemas (ADR-0006). Component props
 * come from deriveEditableFields(definition); layout options reuse the same
 * derivation against the layout's optionsSchema. Nothing here is per-component
 * or per-layout.
 */

interface InspectorProps {
  root: LayoutNode
  selectedId: string | null
  onPatchProps: (nodeId: string, patch: Record<string, unknown>) => void
  onPatchOptions: (nodeId: string, patch: Record<string, unknown>) => void
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: EditableFieldSpec
  value: unknown
  onChange: (next: unknown) => void
}) {
  switch (field.control) {
    case 'boolean':
      return (
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
      )
    case 'number':
      return (
        <input
          type="number"
          value={typeof value === 'number' ? value : ''}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        />
      )
    case 'select':
      return (
        <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
          {(field.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )
    case 'textarea':
    case 'richtext':
      return (
        <textarea
          rows={4}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    case 'url':
    case 'image':
    case 'text':
    default:
      return (
        <input
          type={field.control === 'url' ? 'url' : 'text'}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
        />
      )
  }
}

function FieldList({
  fields,
  values,
  onPatch,
}: {
  fields: EditableFieldSpec[]
  values: Record<string, unknown>
  onPatch: (patch: Record<string, unknown>) => void
}) {
  return (
    <>
      {fields.map((field) => (
        <Field key={field.name}>
          <span>
            {field.label}
            {field.required ? ' *' : ''}
          </span>
          <FieldControl
            field={field}
            value={values[field.name]}
            onChange={(next) => onPatch({ [field.name]: next })}
          />
          {field.help ? <small>{field.help}</small> : null}
        </Field>
      ))}
    </>
  )
}

export function Inspector({ root, selectedId, onPatchProps, onPatchOptions }: InspectorProps) {
  if (!selectedId) return <p>Select a component or layout to edit it.</p>
  const loc = findNode(root, selectedId)
  if (!loc) return <p>Selection no longer exists.</p>

  if (isLayoutNode(loc.node)) {
    const def = getLayout(loc.node.layoutId)
    if (!def) return <p>Unknown layout: {loc.node.layoutId}</p>
    // Layout options reuse the schema→fields derivation (same ADR-0006 path).
    const fields = deriveEditableFields({
      schema: def.optionsSchema,
      fields: {},
    } as unknown as ComponentDefinition)
    return (
      <div data-testid="inspector-layout">
        <h3>{def.name}</h3>
        <FieldList
          fields={fields}
          values={{ ...def.defaultOptions, ...loc.node.options }}
          onPatch={(patch) => onPatchOptions(selectedId, patch)}
        />
      </div>
    )
  }

  const def = getComponent(loc.node.componentId)
  if (!def) return <p>Unknown component: {loc.node.componentId}</p>
  const fields = deriveEditableFields(def)
  const inline = fields.filter((f) => f.inline)
  const rest = fields.filter((f) => !f.inline)
  const values = { ...def.defaultProps, ...loc.node.props }
  return (
    <div data-testid="inspector-component">
      <h3>{def.name}</h3>
      {inline.length > 0 ? (
        <>
          <h4>Content</h4>
          <FieldList fields={inline} values={values} onPatch={(p) => onPatchProps(selectedId, p)} />
        </>
      ) : null}
      {rest.length > 0 ? (
        <>
          <h4>Settings</h4>
          <FieldList fields={rest} values={values} onPatch={(p) => onPatchProps(selectedId, p)} />
        </>
      ) : null}
    </div>
  )
}
