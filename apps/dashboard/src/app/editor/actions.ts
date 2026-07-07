'use server'

import { revalidatePath } from 'next/cache'
import { pageDefinitionSchema, type PageDefinition } from '@atlas/shared'
import { publishPage, savePageDraft, schedulePage } from '@/lib/cms-stub'

/**
 * Editor write path (docs/atlas §04): Server Actions validating against the
 * same Zod schemas as the public API, then calling the cms layer. These
 * signatures survive the stub → Supabase swap unchanged.
 */

export async function saveDraftAction(input: unknown) {
  const page: PageDefinition = pageDefinitionSchema.parse(input)
  const result = await savePageDraft(page)
  revalidatePath('/')
  return result
}

export async function publishAction(pageId: string) {
  const result = await publishPage(pageId)
  revalidatePath('/')
  return result
}

export async function scheduleAction(pageId: string, whenIso: string) {
  const when = new Date(whenIso)
  if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
    throw new Error('scheduleAction: scheduled time must be a valid future datetime')
  }
  const result = await schedulePage(pageId, when.toISOString())
  revalidatePath('/')
  return result
}
