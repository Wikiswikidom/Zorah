import Link from 'next/link'
import { requireRole } from '@/lib/auth/authorization'
import { createAdminClient } from '@/lib/supabase/admin'
import TermsEditor from './terms-editor'

export const dynamic = 'force-dynamic'

export default async function AdminTermsPage() {
  await requireRole(['content_admin'])
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('legal_pages')
    .select('slug,title,body,version,is_published,updated_at')
    .eq('slug', 'terms-and-conditions')
    .maybeSingle()

  const page = data ?? {
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    body: '',
    version: '1.0',
    is_published: false,
    updated_at: null,
  }

  return (
    <main className="zorah-content-page">
      <header className="zorah-content-header">
        <Link href="/admin/content" className="zorah-content-brand">ZORAH</Link>
        <div className="zorah-content-header-actions">
          <Link href="/terms-and-conditions" target="_blank" className="zorah-content-store-link">Preview customer page ↗</Link>
          <Link href="/admin/content" className="zorah-content-store-link">Back to content</Link>
        </div>
      </header>

      <section className="zorah-content-wrap">
        <div className="zorah-content-intro">
          <span className="zorah-content-kicker">Legal / customer trust</span>
          <h1>Terms &amp; Conditions</h1>
          <p>Maintain the customer-facing agreement shown before payment. Save a new version whenever the terms materially change.</p>
        </div>
        <TermsEditor initialPage={page} />
      </section>
    </main>
  )
}
