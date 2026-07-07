import type { Condition } from '@atlas/shared'

/**
 * Conditional-field visibility. A field with `visibleWhen` is shown (and
 * validated) only when its condition holds against the current form data.
 * Evaluated identically on client (render) and server (validation) — one
 * definition, one behaviour (ADR-0006).
 */
export function evaluateCondition(condition: Condition, data: Record<string, unknown>): boolean {
  const actual = data[condition.field]
  switch (condition.operator) {
    case 'eq':
      return String(actual ?? '') === String(condition.value ?? '')
    case 'neq':
      return String(actual ?? '') !== String(condition.value ?? '')
    case 'in':
      return Array.isArray(condition.value) && condition.value.includes(String(actual ?? ''))
    case 'notin':
      return Array.isArray(condition.value) && !condition.value.includes(String(actual ?? ''))
    case 'truthy':
      return Boolean(actual) && actual !== 'false'
    case 'falsy':
      return !actual || actual === 'false'
  }
}
