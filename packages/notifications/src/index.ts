/**
 * @atlas/notifications — Tier 2
 *
 * Event-driven communications: emit(event) fans out to subscribers, each
 * producing validated notification OUTBOX rows (Stage-2 `notifications` table)
 * drained by apps/worker. Includes the reference booking.created →
 * confirmation-email + scheduled reminder-SMS + internal-note wiring.
 */
export const PACKAGE_NAME = '@atlas/notifications' as const

export * from './bus'
export * from './booking-defaults'
