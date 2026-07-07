import type { EventBus, OutboxRow } from './bus'

/**
 * Reference wiring for the booking module (the brief's canonical chain):
 *
 *   Booking Created → Confirmation Email → Reminder SMS → Internal Notification
 *
 * Payload contract for 'booking.created': { bookingId, customerName,
 * customerEmail, customerPhone?, serviceName, startsAt (ISO) }.
 */

export const REMINDER_LEAD_HOURS = 24

export function registerBookingDefaults(bus: EventBus): void {
  bus.on('booking.created', ({ tenantId, payload }) => {
    const rows: OutboxRow[] = [
      {
        tenantId,
        event: 'booking.created',
        channel: 'email',
        payload: {
          templateKey: 'booking_confirmation',
          to: payload.customerEmail,
          vars: payload,
        },
      },
      {
        tenantId,
        event: 'booking.created',
        channel: 'internal',
        payload: { kind: 'new-booking', bookingId: payload.bookingId },
      },
    ]

    // Reminder SMS only when we can reach the customer and the lead time fits.
    const startsAt = typeof payload.startsAt === 'string' ? Date.parse(payload.startsAt) : Number.NaN
    const reminderAt = startsAt - REMINDER_LEAD_HOURS * 3_600_000
    if (payload.customerPhone && !Number.isNaN(startsAt) && reminderAt > Date.now()) {
      rows.push({
        tenantId,
        event: 'booking.created',
        channel: 'sms',
        payload: {
          templateKey: 'booking_reminder',
          to: payload.customerPhone,
          vars: payload,
        },
        scheduledFor: new Date(reminderAt).toISOString(),
      })
    }

    return rows
  })
}
