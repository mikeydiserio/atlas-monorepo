/**
 * @atlas/email — Tier 2
 *
 * Email provider abstraction + tenant template rendering. The platform depends
 * on the EmailProvider interface only; adapters are configured in apps/worker.
 */
export const PACKAGE_NAME = '@atlas/email' as const

export * from './provider'
