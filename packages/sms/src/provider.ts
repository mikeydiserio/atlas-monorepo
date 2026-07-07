import { renderTemplate } from '@atlas/shared'

/**
 * SMS provider abstraction — the sibling of @atlas/email's contract. Concrete
 * adapters (Twilio, MessageBird, …) implement it in apps/worker config.
 * Templates are tenant-authored rows (`sms_templates`).
 */

export interface SmsMessage {
  to: string
  body: string
}

export interface SendResult {
  ok: boolean
  providerId?: string
  error?: string
}

export interface SmsProvider {
  readonly name: string
  send(message: SmsMessage): Promise<SendResult>
}

/** SMS bodies are length-budgeted; warn-level truncation guard at 480 chars (3 segments). */
export const SMS_MAX_LENGTH = 480

export async function sendTemplatedSms(
  provider: SmsProvider,
  template: { body: string },
  to: string,
  vars: Record<string, unknown>
): Promise<SendResult> {
  const body = renderTemplate(template.body, vars)
  return provider.send({ to, body: body.length > SMS_MAX_LENGTH ? `${body.slice(0, SMS_MAX_LENGTH - 1)}…` : body })
}

/** Dev/test provider: records instead of sending. */
export function createMemorySmsProvider(): SmsProvider & { sent: SmsMessage[] } {
  const sent: SmsMessage[] = []
  return {
    name: 'memory',
    sent,
    async send(message) {
      sent.push(message)
      return { ok: true, providerId: `mem-${sent.length}` }
    },
  }
}
