/**
 * @atlas/analytics — Tier 2
 *
 * Event capture (validated track() over an injected sink) and pure
 * per-tenant aggregation helpers. Heavy aggregation lives in SQL.
 */
export const PACKAGE_NAME = '@atlas/analytics' as const

export * from './track'
