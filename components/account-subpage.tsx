import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StorefrontHeader } from '@/components/storefront-header'

type Props={title:string;description:string;icon:string;children:React.ReactNode}

export async function AccountSubpage({title,description,icon,children}:Props){
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  if(!user) redirect(`/login?next=${encodeURIComponent('/account')}`)
  const {data:profile}=await supabase.from('profiles').select('full_name').eq('id',user.id).maybeSingle()
  const name=profile?.full_name||user.user_metadata?.full_name||user.email?.split('@')[0]||'Customer'
  return <main className="jumia-market-page"><StorefrontHeader/><div className="jumia-market-wrap"><div className="jumia-breadcrumb"><Link href="/shop">Home</Link><span>›</span><Link href="/account">My Account</Link><span>›</span>{title}</div><div className="jumia-subpage-grid"><aside className="jumia-account-sidebar"><div className="jumia-profile-mini"><div className="jumia-avatar">{name.charAt(0).toUpperCase()}</div><div><strong>{name}</strong><small>{user.email}</small></div></div><Link className="jumia-side-link" href="/account">← My Account</Link><Link className="jumia-side-link" href="/account/orders">▣ Orders</Link><Link className="jumia-side-link" href="/wishlist">♡ Wishlist</Link><Link className="jumia-side-link" href="/account/recently-viewed">◷ Recently Viewed</Link><Link className="jumia-side-link" href="/account/address-book">○ Address Book</Link><Link className="jumia-side-link" href="/account/settings">○ Account Management</Link><a className="jumia-logout-side" href="/auth/signout">↪ Log Out</a></aside><section className="jumia-subpage-content"><div className="jumia-subpage-head"><div className="jumia-subpage-icon">{icon}</div><div><h1>{title}</h1><p>{description}</p></div></div>{children}</section></div></div></main>
}
