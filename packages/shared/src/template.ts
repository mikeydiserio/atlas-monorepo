/**
 * Template interpolation for email/SMS templates (`{{variable}}` syntax —
 * matches the `email_templates.body` / `sms_templates.body` columns).
 * Pure, dependency-free; unknown variables render as empty strings so a
 * missing var never leaks `{{raw}}` syntax to a customer.
 */
export function renderTemplate(template: string, vars: Record<string, unknown>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, key: string) => {
    const value = key
      .split('.')
      .reduce<unknown>((acc, part) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[part] : undefined), vars)
    return value === undefined || value === null ? '' : String(value)
  })
}
