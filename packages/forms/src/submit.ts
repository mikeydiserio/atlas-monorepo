import type { FormDefinition } from '@atlas/shared'
import { validateSubmission, type FormValidationResult } from './validator'

/**
 * The submission pipeline: spam check → validate visible fields → persist →
 * notify. Persistence and notification are injected seams (the same pattern as
 * the dashboard's cms stub): the pipeline is pure orchestration, testable
 * headlessly, and identical whether backed by the stub or Supabase.
 */

export interface SubmissionMeta {
  ipHash?: string
  userAgent?: string
  referrer?: string
}

export interface SubmissionRecord {
  tenantId: string
  formId: string
  data: Record<string, unknown>
  meta: SubmissionMeta
}

export interface SubmitDeps {
  persist: (record: SubmissionRecord) => Promise<{ id: string }>
  /** Emits 'form.submitted' into the notification bus (Stage 10 §3). */
  notify: (event: 'form.submitted', payload: Record<string, unknown>) => Promise<void>
}

export type SubmitResult =
  | { status: 'accepted'; submissionId: string }
  | { status: 'invalid'; issues: FormValidationResult['issues'] }
  | { status: 'spam' }

export function createSubmissionPipeline(deps: SubmitDeps) {
  return async function submit(
    form: FormDefinition,
    rawData: Record<string, unknown>,
    meta: SubmissionMeta = {}
  ): Promise<SubmitResult> {
    // Honeypot: the hidden field is invisible to humans; any value = bot.
    // Accepted-looking response with no persistence (don't teach the bot).
    const honeypot = rawData[form.settings.honeypot]
    if (typeof honeypot === 'string' && honeypot.length > 0) {
      return { status: 'spam' }
    }

    const result = validateSubmission(form, rawData)
    if (!result.ok) return { status: 'invalid', issues: result.issues }

    const { id } = await deps.persist({
      tenantId: form.tenantId,
      formId: form.id,
      data: result.values,
      meta,
    })

    await deps.notify('form.submitted', {
      tenantId: form.tenantId,
      formId: form.id,
      formKey: form.key,
      submissionId: id,
      notifyEmails: form.settings.notifyEmails,
      webhookUrl: form.settings.webhookUrl,
    })

    return { status: 'accepted', submissionId: id }
  }
}
