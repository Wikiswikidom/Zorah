import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StorefrontHeader } from '@/components/storefront-header'
import CustomOrderForm from '@/components/custom-order-form'
import './custom-orders.css'

export const dynamic = 'force-dynamic'

export default async function CustomOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/custom-orders')
  const { data: profile } = await supabase.from('profiles').select('full_name,role,is_active').eq('id', user.id).maybeSingle()
  if (!profile?.is_active || profile.role !== 'customer') redirect('/shop')

  return <main className="custom-orders-page"><StorefrontHeader/><section className="custom-orders-hero"><div><p className="eyebrow">Made around you</p><h1>Design a bag that is yours.</h1><p>Have a reference image, a sketch, a rough idea—or only a feeling? Tell the Zorah team what you want and we will work with you on a considered bespoke piece.</p></div><div className="custom-orders-note"><span>01 — 03</span><strong>Your idea → our atelier</strong><p>Submit your brief once. We will follow up with you to discuss feasibility, materials, pricing and production.</p></div></section><section className="custom-orders-content"><CustomOrderForm initialName={profile.full_name??user.user_metadata?.full_name??''} initialEmail={user.email??''}/></section></main>
}
