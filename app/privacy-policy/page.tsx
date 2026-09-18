import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Zorah Handbags',
  description: 'How Zorah Handbags collects, uses, protects and manages personal information.',
}

const sections = [
  ['1. Who we are', 'Zorah Handbags is a Nigerian leather-goods business operating an online storefront. For personal data processed through this website, Zorah acts as the data controller except where a third-party provider processes data on our behalf.'],
  ['2. Information we collect', 'We may collect information you provide when you create an account, save delivery information, place an order, join a waitlist, submit a custom-bag request, contact us, or otherwise use customer services. This can include your name, email address, phone number, delivery address, order and payment-reference information, saved products, custom-request details and uploaded reference images. We do not ask you to submit payment-card numbers, PINs or passwords through Zorah forms.'],
  ['3. How we use information', 'We use personal information to create and secure accounts, process and fulfil orders, coordinate delivery, verify payments, provide customer support, manage saved products and waitlists, respond to custom requests, prevent fraud and abuse, maintain security, and meet legal and accounting obligations.'],
  ['4. Payment processing', 'Online payments are handed off to Paystack. Zorah does not intentionally store payment-card numbers, CVVs or PINs in its application database. Payment verification is performed server-side against the transaction and the order stored by Zorah.'],
  ['5. Service providers and international processing', 'Zorah uses technology and payment providers such as Supabase, Vercel, Paystack and, where enabled by the customer, Google authentication. These providers may process information outside Nigeria. Zorah will use appropriate contractual, technical and organisational safeguards and lawful transfer mechanisms required by applicable Nigerian data-protection law.'],
  ['6. Security', 'Zorah uses server-side authorization, role-based access control, database row-level security, protected server credentials, payment verification, signed payment webhooks, audit logging, input validation, controlled file uploads, HTTPS and security headers. No internet-connected service can honestly be guaranteed to be impossible to breach; Zorah therefore maintains preventive, detective and response controls and tests them as the platform evolves.'],
  ['7. Your rights', 'Subject to applicable law and lawful exceptions, you may have rights relating to access, correction, deletion, objection, restriction, portability and withdrawal of consent. To make a privacy request, contact Zorah through the support/contact channel on the website and clearly mark the request as a privacy or data-protection request. We may need to verify your identity before acting on a request.'],
  ['8. Retention', 'We retain information only for as long as reasonably necessary for the purpose for which it was collected, including order fulfilment, customer support, fraud prevention, accounting, legal obligations and dispute resolution. Specific retention periods may vary by record type and applicable law.'],
  ['9. Cookies and browser storage', 'Zorah uses authentication/session cookies required for account security. The customer commerce experience may also use browser storage for non-sensitive shopping state such as guest cart, wishlist and waitlist information. Delivery addresses and payment credentials are not stored in browser local storage.'],
  ['10. Children', 'The customer account and purchasing features are intended for users who can lawfully enter into the relevant transactions. If you believe a child has provided personal information improperly, contact Zorah so the matter can be reviewed.'],
  ['11. Breach response', 'Where a personal-data breach occurs, Zorah will assess the risk, contain and investigate the incident, preserve relevant evidence, and make notifications required by applicable law. Under the Nigeria Data Protection Act, a qualifying breach that is likely to result in a risk to individuals must be notified to the Nigeria Data Protection Commission within the statutory 72-hour period, with high-risk breaches requiring communication to affected data subjects as required by law.'],
  ['12. Changes and contact', 'This policy may be updated when our services, providers or legal obligations change. The current version will be published on this page. For questions or privacy requests, use the Zorah support/contact channel and identify the request as a data-protection matter.'],
]

export default function PrivacyPolicyPage() {
  return <main className="terms-page">
    <header className="terms-header">
      <Link href="/" className="terms-logo" aria-label="Zorah brand page"><img src="/brand/zorah-wordmark.svg" alt="Zorah"/></Link>
      <div className="terms-header-actions"><span>Customer privacy</span><Link href="/shop">Enter shop ↗</Link></div>
    </header>
    <div className="terms-shell">
      <div className="terms-crumb"><Link href="/">Zorah</Link><span> / </span><span>Privacy Policy</span></div>
      <header className="terms-hero"><div><p className="terms-kicker">Legal / customer trust</p><h1>Privacy Policy</h1><p>How Zorah handles personal information across the website, customer account and shopping experience.</p></div><div className="terms-meta"><span>Current policy</span><strong>1.0</strong><small>Customer-facing version</small></div></header>
      <div className="terms-layout">
        <aside className="terms-index"><span>On this page</span><nav>{sections.map(([heading])=><a href={'#privacy-'+heading.split('.')[0]} key={heading}>{heading.replace(/^\d+\.\s*/, '')}</a>)}</nav></aside>
        <article className="terms-card">{sections.map(([heading,body])=><section id={'privacy-'+heading.split('.')[0]} key={heading} className="terms-section"><h2>{heading}</h2><p>{body}</p></section>)}</article>
      </div>
      <div className="terms-trust"><span>Questions?</span><p>For privacy requests, contact Zorah through the website support/contact channel and mark the request as a data-protection matter.</p><Link href="/help">Get help →</Link></div>
    </div>
  </main>
}
