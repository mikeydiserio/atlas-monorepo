/**
 * @atlas/shared — Tier 0
 *
 * The single source of truth (ADR-0006): Zod schemas and inferred types for
 * every platform entity. Depends on nothing internal. Every other package and
 * app derives its types and validation from here.
 */
export const PACKAGE_NAME = '@atlas/shared' as const

export * from './rbac'
export * from './tenant'
export * from './theme'
export * from './seo'
export * from './page'
export * from './form'
export * from './api'
export * from './template'
