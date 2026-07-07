import { z } from 'zod'

/**
 * The event bus (docs/atlas §Communications). Application events fan out to
 * subscribers; each subscriber returns notification OUTBOX rows (the Stage-2
 * `notifications` table shape). Nothing sends synchronously — apps/worker
 * drains the outbox. Event-driven by construction:
 *
 *   booking.created ──▶ confirmation email ──▶ reminder SMS ──▶ internal note
 */

export const notificationChannelSchema = z.enum(['email', 'sms', 'internal', 'webhook'])
export type NotificationChannel = z.infer<typeof notificationChannelSchema>

/** Shape of a `notifications` outbox row produced by a subscriber. */
export const outboxRowSchema = z.object({
  tenantId: z.string().uuid(),
  event: z.string().min(1),
  channel: notificationChannelSchema,
  payload: z.record(z.string(), z.unknown()).default({}),
  /** Defaults to "now" at insert; future values schedule (e.g. reminders). */
  scheduledFor: z.string().datetime().optional(),
})
export type OutboxRow = z.infer<typeof outboxRowSchema>

export interface EventContext {
  tenantId: string
  payload: Record<string, unknown>
}

export type Subscriber = (ctx: EventContext) => OutboxRow[] | Promise<OutboxRow[]>

export interface EventBus {
  on(event: string, subscriber: Subscriber): void
  /** Fan out to subscribers; returns validated outbox rows ready to insert. */
  emit(event: string, ctx: EventContext): Promise<OutboxRow[]>
}

export function createEventBus(): EventBus {
  const subscribers = new Map<string, Subscriber[]>()
  return {
    on(event, subscriber) {
      const list = subscribers.get(event) ?? []
      list.push(subscriber)
      subscribers.set(event, list)
    },
    async emit(event, ctx) {
      const rows: OutboxRow[] = []
      for (const subscriber of subscribers.get(event) ?? []) {
        for (const row of await subscriber(ctx)) {
          // Validate every row at the boundary — a bad subscriber must not
          // poison the outbox.
          rows.push(outboxRowSchema.parse({ ...row, event }))
        }
      }
      return rows
    },
  }
}
