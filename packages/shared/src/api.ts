import { z } from 'zod'

/**
 * API envelope. The headless API (apps/api) returns structured data — never HTML
 * (ADR-0004). Every response uses this discriminated envelope so consumers get a
 * uniform success/error shape and stable error codes.
 */

export const apiErrorSchema = z.object({
  code: z.enum([
    'unauthorized',
    'forbidden',
    'not_found',
    'validation_error',
    'conflict',
    'rate_limited',
    'internal_error',
  ]),
  message: z.string(),
  /** Field-level validation issues, keyed by path. */
  issues: z.record(z.string(), z.array(z.string())).optional(),
})
export type ApiError = z.infer<typeof apiErrorSchema>

/** Build a response schema for a given payload schema. */
export function apiResponse<T extends z.ZodTypeAny>(payload: T) {
  return z.discriminatedUnion('ok', [
    z.object({ ok: z.literal(true), data: payload }),
    z.object({ ok: z.literal(false), error: apiErrorSchema }),
  ])
}

export type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: ApiError }

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  total: z.number().int().nonnegative(),
})
export type Pagination = z.infer<typeof paginationSchema>

/** Contract version — the page model is a public contract and is versioned. */
export const API_VERSION = '2026-07-01' as const
