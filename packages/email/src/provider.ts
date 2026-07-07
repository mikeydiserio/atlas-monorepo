import { renderTemplate } from '@atlas/shared'

/**
 * Email provider abstraction. The platform depends on this interface only;
 * concrete adapters (Resend, SES, Postmark, …) implement it in apps/worker
 * config. Templates are tenant-authored rows (`email_templates`) with
 * {{variable}} interpolation.
 */

export interface EmailMessage {
  to: string
  subject: string
  html: string
  replyTo?: string
}

export interface SendResult {
  ok: boolean
  providerId?: string
  error?: string
}

export interface EmailProvider {
  readonly name: string
  send(message: EmailMessage): Promise<SendResult>
}

export interface EmailTemplate {
  subject: string
  body: string
}

/** Render a tenant template and send it. The single path all email takes. */
export async function sendTemplatedEmail(
  provider: EmailProvider,
  template: EmailTemplate,
  to: string,
  vars: Record<string, unknown>
): Promise<SendResult> {
  return provider.send({
    to,
    subject: renderTemplate(template.subject, vars),
    html: renderTemplate(template.body, vars),
  })
}

/** Dev/test provider: records instead of sending. */
export function createMemoryEmailProvider(): EmailProvider & { sent: EmailMessage[] } {
  const sent: EmailMessage[] = []
  return {
    name: 'memory',
    sent,
    async send(message) {
      sent.push(message)
      return { ok: true, providerId: `mem-${sent.length}` }
    },
  }
}
