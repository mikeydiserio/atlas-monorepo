/**
 * @atlas/sms — Tier 2
 *
 * SMS provider abstraction + tenant template rendering, sibling of
 * @atlas/email. Adapters are configured in apps/worker.
 */
export const PACKAGE_NAME = '@atlas/sms' as const

export * from './provider'
