import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminMfaForm } from '@/components/admin/admin-mfa-form'

const roles = new Set(['super_admin','catalog_admin','order_admin','content_admin','marketing_admin','ads_admin','support_admin','analytics_admin','operations_admin'])
function safeNext(value: string | undefined) {
  const next=value||'/admin'
  return next.startsWith('/')&&!next.startsWith('//')?next:'/admin'
}

export default async function AdminMfaPage({searchParams}:{searchParams:Promise<{next?:string}>}) {
  const params=await searchParams
  const next=safeNext(params.next)
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  if(!user)redirect(`/admin-login?next=${encodeURIComponent(next)}`)
  const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',user.id).maybeSingle()
  if(!profile?.is_active||!roles.has(profile.role))redirect('/login?error=invalid')
  const {data:aal}=await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if(aal?.currentLevel==='aal2')redirect(next)
  return <AdminMfaForm nextPath={next} email={user.email||''}/>
}
