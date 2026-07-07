/**
 * @atlas/forms — Tier 2
 *
 * Dynamic form engine runtime (ADR-0006): the authored FormSchema compiles to
 * Zod validators used identically client- and server-side; conditional fields
 * are evaluated by one function everywhere; the submission pipeline is pure
 * orchestration over injected persist/notify seams.
 */
export const PACKAGE_NAME = '@atlas/forms' as const

export * from './conditions'
export * from './validator'
export * from './submit'
