import { z } from 'zod'

/**
 * Analytics capture + aggregation. track() validates and hands the event to an
 * injected sink (Supabase `analytics_events` insert in production, memory in
 * tests). Aggregations are pure helpers over event rows — the heavy versions
 * live in SQL; these serve dashboards and tests.
 */

export const analyticsEventSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(64),
  props: z.record(z.string(), z.unknown()).default({}),
  sessionId: z.string().optional(),
  path: z.string().optional(),
  occurredAt: z.string().datetime(),
})
export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>

export type EventSink = (event: AnalyticsEvent) => Promise<void>

export function createTracker(sink: EventSink) {
  return async function track(input: Omit<AnalyticsEvent, 'occurredAt'> & { occurredAt?: string }) {
    const event = analyticsEventSchema.parse({
      ...input,
      occurredAt: input.occurredAt ?? new Date().toISOString(),
    })
    await sink(event)
    return event
  }
}

/** Event counts by name (per tenant — caller passes one tenant's rows). */
export function countByName(events: AnalyticsEvent[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const event of events) counts[event.name] = (counts[event.name] ?? 0) + 1
  return counts
}

/** Daily time series ('YYYY-MM-DD' → count), optionally filtered by name. */
export function dailySeries(events: AnalyticsEvent[], name?: string): Record<string, number> {
  const series: Record<string, number> = {}
  for (const event of events) {
    if (name && event.name !== name) continue
    const day = event.occurredAt.slice(0, 10)
    series[day] = (series[day] ?? 0) + 1
  }
  return series
}
