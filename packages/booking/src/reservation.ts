/**
 * Reservation lifecycle — a state machine mirroring the Stage-2 `bookings.status`
 * check constraint. All transition rules live here; the API/dashboard call
 * `transition()` and never mutate status ad hoc.
 *
 *   pending ──confirm──▶ confirmed ──complete──▶ completed
 *      │                    │  │
 *      └──────cancel────────┘  └──no_show──▶ no_show
 *   (cancel from pending or confirmed; reschedule keeps the current status)
 */

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
export type BookingAction = 'confirm' | 'cancel' | 'complete' | 'no_show' | 'reschedule'

const TRANSITIONS: Record<BookingAction, Partial<Record<BookingStatus, BookingStatus>>> = {
  confirm: { pending: 'confirmed' },
  cancel: { pending: 'cancelled', confirmed: 'cancelled' },
  complete: { confirmed: 'completed' },
  no_show: { confirmed: 'no_show' },
  // Reschedule changes times, not state — valid only while the booking is live.
  reschedule: { pending: 'pending', confirmed: 'confirmed' },
}

export type TransitionResult =
  | { ok: true; next: BookingStatus }
  | { ok: false; reason: string }

export function transition(current: BookingStatus, action: BookingAction): TransitionResult {
  const next = TRANSITIONS[action][current]
  if (!next) {
    return { ok: false, reason: `cannot ${action} a ${current} booking` }
  }
  return { ok: true, next }
}

export interface RescheduleInput {
  status: BookingStatus
  newStartsAt: string
  newEndsAt: string
  /** Earliest permitted start (e.g. now + notice period). */
  notBefore?: string
}

export type RescheduleResult =
  | { ok: true; startsAt: string; endsAt: string }
  | { ok: false; reason: string }

/** Guarded reschedule: state must allow it and the new window must be sane. */
export function reschedule(input: RescheduleInput): RescheduleResult {
  const guard = transition(input.status, 'reschedule')
  if (!guard.ok) return guard
  const start = Date.parse(input.newStartsAt)
  const end = Date.parse(input.newEndsAt)
  if (Number.isNaN(start) || Number.isNaN(end) || start >= end) {
    return { ok: false, reason: 'new times must be a valid interval' }
  }
  if (input.notBefore && start < Date.parse(input.notBefore)) {
    return { ok: false, reason: 'new time is before the earliest permitted start' }
  }
  return { ok: true, startsAt: new Date(start).toISOString(), endsAt: new Date(end).toISOString() }
}
