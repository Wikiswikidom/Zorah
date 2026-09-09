import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { StorefrontHeader } from '@/components/storefront-header'

export const dynamic = 'force-dynamic'

const accountLinks = [
  { title: 'Orders', text: 'Track purchases, delivery and returns', icon: '▣', href: '/account/orders' },
  { title: 'Wishlist', text: 'Keep the pieces you are considering', icon: '♡', href: '/wishlist' },
  { title: 'Recently Viewed', text: 'Return to products you explored', icon: '◷', href: '/account/recently-viewed' },
  { title: 'Custom Bag', text: 'Send us your own bag idea or reference', icon: '◇', href: '/custom-orders' },
]
const settingLinks = [
  { title: 'Address Book', text: 'Manage your saved delivery addresses', href: '/account/address-book' },
  { title: 'Account Management', text: 'Update your name, phone and account details', href: '/account/settings' },
  { title: 'Password & Security', text: 'Change your password and protect your account', href: '/account/update-password' },
]

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/account')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name, role, is_active, phone')
    .eq('id', user.id)
    .maybeSingle()

  // The customer portal is strictly customer-only. Staff are never silently
  // sent to the storefront from /account; they must use the separate admin portal.
  if (profile?.role && profile.role !== 'customer') {
    redirect('/admin-login?error=staff_use_admin')
  }
  if (!profile || !profile.is_active) {
    redirect('/login?error=account_unavailable&next=/account')
  }

  const name = profile.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer'
  const firstName = name.split(' ')[0]
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id,order_number,total,currency,status,payment_status,created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  return <main className="jumia-account-page">
    <StorefrontHeader />
    <div className="jumia-account-wrap">
      <div className="jumia-breadcrumb"><Link href="/shop">Home</Link><span>›</span> My Account</div>
      <div className="jumia-account-mobile-shortcuts">{accountLinks.map(item => <Link href={item.href} key={item.title}><span>{item.icon}</span>{item.title}</Link>)}</div>
      <div className="jumia-account-layout">
        <aside className="jumia-account-sidebar">
          <div className="jumia-profile-mini"><div className="jumia-avatar">{firstName.charAt(0).toUpperCase()}</div><div><strong>{name}</strong><small>{user.email}</small></div></div>
          <div className="jumia-side-heading">My Account</div>
          {accountLinks.map(item => <Link href={item.href} className="jumia-side-link" key={item.title}><span>{item.icon}</span>{item.title}<b>›</b></Link>)}
          <div className="jumia-side-heading">Settings</div>
          {settingLinks.map(item => <Link href={item.href} className="jumia-side-link" key={item.title}><span>○</span>{item.title}<b>›</b></Link>)}
          <form action="/auth/signout" method="post"><button className="jumia-logout-side" type="submit">↪ Log Out</button></form>
        </aside>
        <section className="jumia-account-content">
          <div className="jumia-welcome-card"><div><span>WELCOME BACK</span><h1>Hi, {firstName}</h1><p>Manage your Zorah orders, saved bags and account from one place.</p></div><div className="jumia-welcome-mark">Z</div></div>
          <div className="jumia-account-heading"><h2>My Zorah Account</h2><Link href="/shop">Continue shopping ›</Link></div>
          <div className="jumia-account-cards">{accountLinks.map(item => <Link href={item.href} className="jumia-account-card" key={item.title}><div className="jumia-card-icon">{item.icon}</div><div><h3>{item.title}</h3><p>{item.text}</p></div><b>›</b></Link>)}</div>

          <div className="jumia-account-heading settings-heading"><h2>Recent orders</h2><Link href="/account/orders">View all ›</Link></div>
          {!recentOrders?.length ? <div className="jumia-empty-card jumia-account-recent-empty"><div className="jumia-empty-icon">▣</div><h2>No orders yet</h2><p>Your purchases will appear here after checkout.</p><Link className="jumia-primary-btn" href="/shop">Start Shopping</Link></div> : <div className="jumia-orders-list">{recentOrders.map(order => <Link href="/account/orders" className="jumia-order-card" key={order.id}><div className="jumia-order-head"><div><strong>Order #{order.order_number}</strong><span>{new Date(order.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</span></div><span className={`jumia-status status-${String(order.status).toLowerCase().replace(/[^a-z0-9]+/g,'-')}`}>{order.status}</span></div><div className="jumia-order-foot"><span>{order.payment_status}</span><strong>{order.currency} {Number(order.total).toLocaleString('en-NG')}</strong></div></Link>)}</div>}

          <div className="jumia-account-heading settings-heading"><h2>Account Information</h2><Link href="/account/settings">Edit ›</Link></div>
          <div className="jumia-info-card"><div><span>Name</span><strong>{name}</strong></div><div><span>Email</span><strong>{user.email}</strong></div><div><span>Phone</span><strong>{profile.phone || user.user_metadata?.phone || 'Add a phone number'}</strong></div></div>
          <div className="jumia-help-strip"><div><strong>Need help?</strong><span>We’re here to help with your order, delivery, payment or custom bag.</span></div><Link href="/help">Help &amp; Support ›</Link></div>
          <div className="jumia-logout"><form action="/auth/signout" method="post"><button type="submit">Log Out</button></form></div>
        </section>
      </div>
    </div>
  </main>
}
