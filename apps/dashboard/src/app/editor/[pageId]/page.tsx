import { notFound } from 'next/navigation'
import { Editor } from '@/components/editor/editor'
import { getPageDraft } from '@/lib/cms-stub'

export default async function EditorPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params
  const page = await getPageDraft(pageId)
  if (!page) notFound()
  return <Editor initial={page} />
}
