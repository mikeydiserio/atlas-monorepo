import { describe, expect, it } from 'vitest'
import { countByName, createTracker, dailySeries, type AnalyticsEvent } from './index'

// Mirrors the Stage-10 esbuild runtime-verification harness.

const TENANT = 'a1b2c3d4-0002-4a1b-8b2c-000000000002'

describe('tracker + aggregations', () => {
  it('validates events, defaults occurredAt, and aggregates', async () => {
    const store: AnalyticsEvent[] = []
    const track = createTracker(async (e) => {
      store.push(e)
    })
    await track({ tenantId: TENANT, name: 'page_view', props: {}, occurredAt: '2026-07-06T10:00:00Z' })
    await track({ tenantId: TENANT, name: 'page_view', props: {}, occurredAt: '2026-07-07T09:00:00Z' })
    await track({ tenantId: TENANT, name: 'booking_started', props: {} }) // occurredAt defaulted

    await expect(track({ tenantId: 'nope', name: 'x', props: {} })).rejects.toThrow()

    expect(countByName(store)).toMatchObject({ page_view: 2, booking_started: 1 })
    expect(dailySeries(store, 'page_view')).toEqual({ '2026-07-06': 1, '2026-07-07': 1 })
  })
})
