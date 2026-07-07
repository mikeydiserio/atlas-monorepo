import { formDefinitionSchema } from '@atlas/shared'
import { describe, expect, it } from 'vitest'
import { createSubmissionPipeline, evaluateCondition, validateSubmission } from './index'

// Mirrors the Stage-10 esbuild runtime-verification harness.

const form = formDefinitionSchema.parse({
  id: 'a1b2c3d4-0003-4a1b-8b2c-000000000003',
  tenantId: 'a1b2c3d4-0002-4a1b-8b2c-000000000002',
  key: 'contact',
  name: 'Contact',
  schema: {
    fields: [
      { name: 'email', type: 'email', label: 'Email', required: true },
      {
        name: 'reason',
        type: 'select',
        label: 'Reason',
        required: true,
        options: [
          { label: 'Sales', value: 'sales' },
          { label: 'Support', value: 'support' },
        ],
      },
      {
        name: 'orderId',
        type: 'text',
        label: 'Order ID',
        required: true,
        validation: { minLength: 4 },
        visibleWhen: { field: 'reason', operator: 'eq', value: 'support' },
      },
    ],
  },
  settings: {},
})

describe('evaluateCondition', () => {
  it('implements all six operators', () => {
    const d = { reason: 'support', agree: 'true' }
    expect(evaluateCondition({ field: 'reason', operator: 'eq', value: 'support' }, d)).toBe(true)
    expect(evaluateCondition({ field: 'reason', operator: 'neq', value: 'sales' }, d)).toBe(true)
    expect(evaluateCondition({ field: 'reason', operator: 'in', value: ['support'] }, d)).toBe(true)
    expect(evaluateCondition({ field: 'reason', operator: 'notin', value: ['sales'] }, d)).toBe(true)
    expect(evaluateCondition({ field: 'agree', operator: 'truthy' }, d)).toBe(true)
    expect(evaluateCondition({ field: 'missing', operator: 'falsy' }, d)).toBe(true)
  })
})

describe('validateSubmission', () => {
  it('skips hidden required fields and discards their values', () => {
    const result = validateSubmission(form, { email: 'a@b.co', reason: 'sales', orderId: 'stale' })
    expect(result.ok).toBe(true)
    expect(result.values).not.toHaveProperty('orderId')
  })

  it('enforces visible required fields and constraints', () => {
    expect(validateSubmission(form, { email: 'a@b.co', reason: 'support' }).issues.orderId).toBeDefined()
    expect(validateSubmission(form, { email: 'nope', reason: 'refund' }).ok).toBe(false)
  })
})

describe('createSubmissionPipeline', () => {
  it('spam short-circuits; valid submissions persist and notify', async () => {
    const persisted: unknown[] = []
    const events: string[] = []
    const submit = createSubmissionPipeline({
      persist: async (r) => {
        persisted.push(r)
        return { id: 'sub-1' }
      },
      notify: async (e) => {
        events.push(e)
      },
    })
    expect((await submit(form, { email: 'a@b.co', reason: 'sales', _hp: 'bot' })).status).toBe('spam')
    expect(persisted).toHaveLength(0)
    const ok = await submit(form, { email: 'a@b.co', reason: 'sales' })
    expect(ok).toMatchObject({ status: 'accepted', submissionId: 'sub-1' })
    expect(events).toEqual(['form.submitted'])
  })
})
