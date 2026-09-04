import Link from 'next/link'
import { requireRole } from '@/lib/auth/authorization'
import LandingCmsPanel from '@/components/admin/landing-cms-panel'

export default async function AdminContentPage(){
  await requireRole(['content_admin','marketing_admin'])
  return <main className="zorah-content-page">
    <header className="zorah-content-header">
      <Link href="/admin" className="zorah-content-brand">ZORAH</Link>
      <div className="zorah-content-header-actions"><Link href="/" target="_blank" className="zorah-content-store-link">Preview homepage ↗</Link><Link href="/admin" className="zorah-content-store-link">Back to admin</Link></div>
    </header>
    <section className="zorah-content-wrap">
      <div className="zorah-content-intro">
        <span className="zorah-content-kicker">Content management</span>
        <h1>Homepage editor</h1>
        <p>Edit the actual Zorah customer homepage from one place: logo, hero slides, images, copy, buttons, visibility and section order. No code changes are required.</p>
      </div>
      <LandingCmsPanel/>
    </section>
  </main>
}
