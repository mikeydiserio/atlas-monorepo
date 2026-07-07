import { renderTemplate } from '@atlas/shared'
import { describe, expect, it } from 'vitest'
import { createEventBus, registerBookingDefaults, REMINDER_LEAD_HOURS } from './index'

// Mirrors the Stage-10 esbuild runtime-verification harness.

const TENANT = 'a1b2c3d4-0002-4a1b-8b2c-000000000002'

describe('event bus + booking defaults', () => {
  it('booking.created fans out to email + scheduled sms + internal', async () => {
    const bus = createEventBus()
    registerBookingDefaults(bus)
    const startsAt = new Date(Date.now() + 72 * 3_600_000).toISOString()
    const rows = await bus.emit('booking.created', {
      tenantId: TENANT,
      payload: {
        bookingId: 'b-1',
        customerEmail: 'jo@example.com',
        customerPhone: '+61 400 000 000',
        serviceName: 'Checkup',
        startsAt,
      },
    })
    expect(rows.map((r) => r.channel).sort()).toEqual(['email', 'internal', 'sms'])
    const sms = rows.find((r) => r.channel === 'sms')
    expect(sms?.scheduledFor).toBe(new Date(Date.parse(startsAt) - REMINDER_LEAD_HOURS * 3_600_000).toISOString())
  })

  it('skips the sms without a phone and rejects invalid outbox rows', async () => {
    const bus = createEventBus()
    registerBookingDefaults(bus)
    const rows = await bus.emit('booking.created', {
      tenantId: TENANT,
      payload: { bookingId: 'b-2', customerEmail: 'jo@example.com', startsAt: new Date(Date.now() + 172_800_000).toISOString() },
    })
    expect(rows.some((r) => r.channel === 'sms')).toBe(false)

    bus.on('x.bad', () => [{ tenantId: 'not-a-uuid', event: 'x.bad', channel: 'email', payload: {} }])
    await expect(bus.emit('x.bad', { tenantId: TENANT, payload: {} })).rejects.toThrow()
  })
})

describe('renderTemplate', () => {
  it('interpolates vars (nested paths) and blanks missing ones', () => {
    expect(renderTemplate('Hi {{name}}, {{a.b}}!', { name: 'Jo', a: { b: 'nested' } })).toBe('Hi Jo, nested!')
    expect(renderTemplate('{{missing}}', {})).toBe('')
  })
})
