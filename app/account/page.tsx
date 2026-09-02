import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/account')

  const { data: profile } = await supabase.from('profiles').select('full_name, role, is_active').eq('id', user.id).maybeSingle()
  const isStaff = Boolean(profile?.is_active && profile.role && profile.role !== 'customer')

  return (
    <main className="account-page">
      <header className="account-header"><a href="/" className="account-logo">ZORAH</a><nav><a href="/shop">Shop</a><a href="/our-story">Our story</a>{isStaff && <a className="account-admin" href="/admin">Admin</a>}</nav></header>
      <section className="account-hero"><p className="account-kicker">Your Zorah account</p><h1>Welcome, {profile?.full_name || user.user_metadata?.full_name || 'there'}.</h1><p>Keep your orders, saved pieces and Zorah experience in one place.</p></section>
      <section className="account-grid">
        <article><span>01</span><h2>Orders</h2><p>Your order history will appear here as purchases are completed.</p><a href="/shop">Continue shopping →</a></article>
        <article><span>02</span><h2>Saved pieces</h2><p>Wishlist and saved products will live here when you start building your collection.</p><a href="/shop">Explore the collection →</a></article>
        <article><span>03</span><h2>Account</h2><p>{user.email}</p><small>{profile?.role || 'customer'}</small></article>
      </section>
      <footer className="account-footer"><a href="/">Zorah Handbags</a><span>Lagos · Nigeria</span></footer>
    </main>
  )
}
