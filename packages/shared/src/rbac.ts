import { z } from 'zod'

/**
 * RBAC catalog — mirrors the seeded `permissions` and template `roles` in
 * supabase/migrations/0002_tenancy_and_rbac.sql. Keeping these as const tuples
 * (not just DB rows) gives compile-time safety wherever a permission or role key
 * is referenced in application code.
 */

export const PERMISSIONS = [
  'tenant.manage',
  'member.manage',
  'page.view',
  'page.edit',
  'page.publish',
  'asset.manage',
  'theme.manage',
  'navigation.manage',
  'form.manage',
  'booking.manage',
  'module.manage',
  'analytics.view',
  'comms.manage',
] as const

export const permissionSchema = z.enum(PERMISSIONS)
export type Permission = z.infer<typeof permissionSchema>

export const SYSTEM_ROLES = [
  'platform_admin',
  'agency_admin',
  'developer',
  'designer',
  'client_admin',
  'content_editor',
  'marketing',
  'support',
] as const

export const systemRoleSchema = z.enum(SYSTEM_ROLES)
export type SystemRole = z.infer<typeof systemRoleSchema>

export const roleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  key: z.string().min(1),
  name: z.string().min(1),
  isSystem: z.boolean(),
  permissions: z.array(permissionSchema).default([]),
})
export type Role = z.infer<typeof roleSchema>
