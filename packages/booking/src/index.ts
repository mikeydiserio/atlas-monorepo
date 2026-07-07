/**
 * @atlas/booking — Tier 2
 *
 * Bookings domain engines: the availability engine (weekly rules + exceptions
 * → concrete slots honouring duration, buffers, and collisions) and the
 * reservation lifecycle state machine. Pure logic — persistence lives behind
 * the cms seam; the DB schema is Stage 2's services/staff/availability/bookings.
 */
export const PACKAGE_NAME = '@atlas/booking' as const

export * from './availability'
export * from './reservation'
