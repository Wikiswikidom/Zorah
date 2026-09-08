import Link from 'next/link'
import { requireRole } from '@/lib/auth/authorization'
import LegalPageEditor from '@/components/admin/legal-page-editor'

export default async function AdminTermsPage(){
  await requireRole(['content_admin'])
  return <main className="zorah-content-page">
    <header className="zorah-content-header">
      <Link href="/admin" className="zorah-content-brand">ZORAH</Link>
      <div className="zorah-content-header-actions"><Link href="/terms-and-conditions" target="_blank" className="zorah-content-store-link">Preview terms ↗</Link><Link href="/admin" className="zorah-content-store-link">Back to admin</Link></div>
    </header>
    <section className="zorah-content-wrap">
      <div className="zorah-content-intro">
        <span className="zorah-content-kicker">Legal & customer trust</span>
        <h1>Terms & Conditions</h1>
        <p>Maintain the customer-facing terms used at checkout. Super Admins and Content Admins can edit and publish this page; checkout records the published version accepted by each customer.</p>
      </div>
      <LegalPageEditor/>
    </section>
  </main>
}
