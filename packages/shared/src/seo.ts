import { z } from 'zod'

/** SEO + page metadata contracts. Carried on the page definition (ADR-0004). */

export const seoSchema = z.object({
  title: z.string().max(70).optional(),
  description: z.string().max(200).optional(),
  canonical: z.string().url().optional(),
  ogImage: z.string().url().optional(),
  ogType: z.string().default('website'),
  noindex: z.boolean().default(false),
  keywords: z.array(z.string()).default([]),
})
export type Seo = z.infer<typeof seoSchema>

export const pageMetadataSchema = z.object({
  title: z.string().min(1),
  /** Internal author-facing note, never rendered. */
  note: z.string().optional(),
})
export type PageMetadata = z.infer<typeof pageMetadataSchema>
