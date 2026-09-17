import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { StorefrontHeader } from '@/components/storefront-header'

type Props={title:string;description:string;icon:string;children:React.ReactNode}
const accountLinks=[
  {title:'Orders',icon:'▣',href:'/account/orders'},
  {title:'Wishlist',icon:'♡',href:'/wishlist'},
  {title:'Waitlist',icon:'◌',href:'/waitlist'},
  {title:'Custom Bag',icon:'◇',href:'/custom-orders'},
]
const settingLinks=[
  {title:'Address Book',href:'/account/address-book'},
  {title:'Account Management',href:'/account/settings'},
  {title:'Password & Security',href:'/account/update-password'},
]

export async function AccountSubpage({title,description,icon,children}:Props){
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  if(!user) redirect(`/login?next=${encodeURIComponent('/account')}`)
  const admin=createAdminClient()
  const {data:profile}=await admin.from('profiles').select('full_name,role,is_active').eq('id',user.id).maybeSingle()
  if(!profile?.is_active || profile.role!=='customer') redirect('/shop')
  const name=profile.full_name||user.user_metadata?.full_name||user.email?.split('@')[0]||'Customer'
  return <main className="jumia-market-page">
    <StorefrontHeader/>
    <div className="jumia-market-wrap">
      <div className="jumia-breadcrumb"><Link href="/shop">Home</Link><span>›</span><Link href="/account">My Account</Link><span>›</span>{title}</div>
      <div className="jumia-account-mobile-shortcuts">{accountLinks.map(item=><Link href={item.href} key={item.title}><span>{item.icon}</span>{item.title}</Link>)}</div>
      <div className="jumia-subpage-grid">
        <aside className="jumia-account-sidebar">
          <div className="jumia-profile-mini"><div className="jumia-avatar">{name.charAt(0).toUpperCase()}</div><div><strong>{name}</strong><small>{user.email}</small></div></div>
          <div className="jumia-side-heading">My Account</div>
          {accountLinks.map(item=><Link className="jumia-side-link" href={item.href} key={item.title}><span>{item.icon}</span>{item.title}<b>›</b></Link>)}
          <div className="jumia-side-heading">Settings</div>
          {settingLinks.map(item=><Link className="jumia-side-link" href={item.href} key={item.title}><span>○</span>{item.title}<b>›</b></Link>)}
          <form action="/auth/signout" method="post"><button className="jumia-logout-side" type="submit">↪ Log Out</button></form>
        </aside>
        <section className="jumia-subpage-content"><div className="jumia-subpage-head"><div className="jumia-subpage-icon">{icon}</div><div><h1>{title}</h1><p>{description}</p></div></div>{children}</section>
      </div>
    </div>
  </main>
}
