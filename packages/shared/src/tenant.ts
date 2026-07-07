import { z } from 'zod'

/** Tenant — the root ownership boundary. See docs/atlas/02-multi-tenancy.md. */

export const tenantStatusSchema = z.enum(['active', 'suspended', 'archived'])
export type TenantStatus = z.infer<typeof tenantStatusSchema>

export const tenantSchema = z.object({
  id: z.string().uuid(),
  slug: z
    .string()
    .min(1)
    .max(63)
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with hyphens'),
  name: z.string().min(1),
  status: tenantStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Tenant = z.infer<typeof tenantSchema>

export const domainSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  hostname: z.string().min(1),
  isPrimary: z.boolean(),
  verifiedAt: z.string().datetime().nullable(),
})
export type Domain = z.infer<typeof domainSchema>
