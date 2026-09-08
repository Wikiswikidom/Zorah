import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import './terms.css'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Terms & Conditions | Zorah Handbags',
  description: 'The terms and conditions governing use of the Zorah website and purchases.',
}

const fallback = {
  title: 'Terms & Conditions',
  version: '1.0',
  body: 'Welcome to Zorah. These Terms & Conditions explain the rules that apply when you browse, create an account, place an order, or use services provided through the Zorah website.\n\n1. Orders and payment\nOrders are confirmed after the required checkout information has been submitted and payment has been successfully processed through our payment provider. Prices and availability may change before an order is completed.\n\n2. Customer information\nYou are responsible for providing accurate contact and delivery information. Zorah uses the information required to process orders, provide customer support, and deliver purchases.\n\n3. Products\nZorah makes leather handbags and related products. Product photographs, colours, dimensions, and materials are presented as accurately as reasonably possible, although small variations may occur because of materials, photography, and handcrafted production.\n\n4. Delivery and returns\nDelivery timelines, delivery charges, returns, and exchanges are subject to the policies displayed by Zorah at the time of purchase.\n\n5. Acceptable use\nYou must not misuse the website, attempt to gain unauthorized access, interfere with its operation, or use the service for fraudulent or unlawful activity.\n\n6. Changes\nZorah may update these terms when necessary. The version shown on this page identifies the terms currently published by Zorah.\n\n7. Contact\nIf you have questions about these terms or an order, please contact Zorah through the customer support channels provided on the website.'
}

export default async function TermsPage() {
  let page = fallback
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('legal_pages').select('title,body,version').eq('slug','terms-and-conditions').eq('is_published',true).maybeSingle()
    if (data) page = data
  } catch (error) {
    console.error('Terms page load failed', error)
  }

  const sections = page.body.split(/\n\n+/).filter(Boolean)
  return <main className="terms-page">
    <header className="terms-header">
      <Link href="/" className="terms-logo" aria-label="Zorah brand page"><img src="/brand/zorah-wordmark.svg" alt="Zorah" /></Link>
      <Link href="/shop" className="terms-shop">Enter shop ↗</Link>
    </header>
    <div className="terms-shell">
      <div className="terms-crumb"><Link href="/">Zorah</Link><span> / </span><span>Terms & Conditions</span></div>
      <header className="terms-hero">
        <p className="terms-kicker">Customer agreement</p>
        <h1>{page.title}</h1>
        <p>These terms explain the conditions that apply when using Zorah and placing an order.</p>
        <span className="terms-version">Version {page.version}</span>
      </header>
      <article className="terms-card">
        {sections.map((section,index)=>{
          const lines=section.split('\n')
          const heading=lines[0]
          const paragraphs=lines.slice(1)
          return <section key={`${heading}-${index}`} className="terms-section">
            {index>0 && /^\d+\./.test(heading) ? <h2>{heading}</h2> : <p className="terms-lead">{heading}</p>}
            {paragraphs.map((paragraph,i)=><p key={i}>{paragraph}</p>)}
          </section>
        })}
      </article>
      <div className="terms-actions"><Link href="/shop">Continue shopping →</Link><Link href="/login">Sign in</Link></div>
    </div>
  </main>
}
