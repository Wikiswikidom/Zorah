import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/account')

  const { data: profile } = await supabase.from('profiles').select('full_name, role, is_active').eq('id', user.id).maybeSingle()
  const isStaff = Boolean(profile?.is_active && profile.role && profile.role !== 'customer')
  const name = profile?.full_name || user.user_metadata?.full_name || 'there'

  return (
    <main className="account-page">
      <header className="account-header"><a href="/" aria-label="Zorah home"><img className="account-logo-image" src="/brand/zorah-logo.webp" alt="Zorah Handbags" /></a><nav><a href="/shop">Shop</a><a href="/our-story">Our story</a>{isStaff && <a className="account-admin" href="/admin">Admin ↗</a>}</nav></header>
      <section className="account-hero"><div><p className="account-kicker">Your Zorah account</p><h1>Welcome,<br /><em>{name}.</em></h1><p>One place for your collection, orders, saved pieces and future Zorah experiences.</p></div><div className="account-seal" aria-hidden="true"><span>Z</span><small>LAGOS<br />NIGERIA</small></div></section>
      <section className="account-grid">
        <article><span>01</span><h2>Orders</h2><p>Your order history will appear here as purchases are completed.</p><a href="/shop">Continue shopping <b>→</b></a></article>
        <article><span>02</span><h2>Saved pieces</h2><p>Build a private edit of the bags you love and return to them whenever you are ready.</p><a href="/shop">Explore the collection <b>→</b></a></article>
        <article><span>03</span><h2>Your details</h2><p>{user.email}</p><small>{profile?.role || 'customer'}</small></article>
      </section>
      {isStaff && <section className="account-staff"><div><span>Staff access</span><h2>Your Zorah workspace is ready.</h2><p>Open the protected administration area to manage the catalogue, campaigns, content and operations available to your role.</p></div><a href="/admin">Open admin <b>↗</b></a></section>}
      <footer className="account-footer"><a href="/">Zorah Handbags</a><span>Lagos · Nigeria</span></footer>
    </main>
  )
}
