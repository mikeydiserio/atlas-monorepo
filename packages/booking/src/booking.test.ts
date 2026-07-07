import { describe, expect, it } from 'vitest'
import { computeSlots, reschedule, transition } from './index'

// Mirrors the Stage-10 esbuild runtime-verification harness.
// 2026-07-13 is a Monday (weekday 1).

const service = { durationMin: 60, bufferBeforeMin: 15, bufferAfterMin: 15 }
const mondayRule = [{ staffId: 's1', weekday: 1, startTime: '09:00', endTime: '12:00' }]

describe('computeSlots', () => {
  it('produces the slot ladder honouring duration + buffers', () => {
    const slots = computeSlots({
      service,
      rules: mondayRule,
      exceptions: [],
      bookings: [],
      fromDate: '2026-07-13',
      toDate: '2026-07-13',
      slotStepMin: 60,
    })
    expect(slots.map((s) => s.startsAt)).toEqual(['2026-07-13T09:15:00.000Z', '2026-07-13T10:15:00.000Z'])
  })

  it('collisions with existing bookings block padded intervals', () => {
    const slots = computeSlots({
      service,
      rules: mondayRule,
      exceptions: [],
      bookings: [{ staffId: 's1', startsAt: '2026-07-13T10:15:00.000Z', endsAt: '2026-07-13T11:15:00.000Z' }],
      fromDate: '2026-07-13',
      toDate: '2026-07-13',
      slotStepMin: 60,
    })
    expect(slots).toHaveLength(0)
  })

  it('exceptions close a day or replace its hours', () => {
    const base = {
      service: { durationMin: 30, bufferBeforeMin: 0, bufferAfterMin: 0 },
      rules: [{ staffId: 's1', weekday: 1, startTime: '09:00', endTime: '11:00' }],
      bookings: [],
      fromDate: '2026-07-13',
      toDate: '2026-07-13',
      slotStepMin: 30,
    }
    expect(
      computeSlots({ ...base, exceptions: [{ staffId: 's1', onDate: '2026-07-13', isClosed: true }] })
    ).toHaveLength(0)
    const altered = computeSlots({
      ...base,
      exceptions: [{ staffId: 's1', onDate: '2026-07-13', isClosed: false, startTime: '10:00', endTime: '11:00' }],
    })
    expect(altered.map((s) => s.startsAt)).toEqual(['2026-07-13T10:00:00.000Z', '2026-07-13T10:30:00.000Z'])
  })
})

describe('reservation lifecycle', () => {
  it('guards transitions; cancelled/completed are terminal', () => {
    expect(transition('pending', 'confirm')).toEqual({ ok: true, next: 'confirmed' })
    expect(transition('confirmed', 'cancel')).toEqual({ ok: true, next: 'cancelled' })
    expect(transition('cancelled', 'confirm').ok).toBe(false)
    expect(transition('completed', 'cancel').ok).toBe(false)
  })

  it('reschedule enforces state, interval sanity, and notice period', () => {
    expect(
      reschedule({ status: 'cancelled', newStartsAt: '2026-08-01T09:00:00Z', newEndsAt: '2026-08-01T10:00:00Z' }).ok
    ).toBe(false)
    expect(
      reschedule({ status: 'pending', newStartsAt: '2026-08-01T10:00:00Z', newEndsAt: '2026-08-01T09:00:00Z' }).ok
    ).toBe(false)
    expect(
      reschedule({
        status: 'confirmed',
        newStartsAt: '2026-08-01T09:00:00Z',
        newEndsAt: '2026-08-01T10:00:00Z',
        notBefore: '2026-08-02T00:00:00Z',
      }).ok
    ).toBe(false)
    expect(
      reschedule({ status: 'pending', newStartsAt: '2026-08-03T09:00:00Z', newEndsAt: '2026-08-03T10:00:00Z' }).ok
    ).toBe(true)
  })
})
