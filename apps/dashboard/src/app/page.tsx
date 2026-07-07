import Link from 'next/link'
import { demoTenant, listPages } from '@/lib/cms-stub'

export default async function PagesIndex() {
  const pages = await listPages(demoTenant.id)
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Pages — {demoTenant.name}</h1>
      <ul>
        {pages.map((page) => (
          <li key={page.id}>
            <Link href={`/editor/${page.id}`}>
              /{page.slug} — {page.metadata.title} ({page.status}, v{page.version})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
