'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireRole, type StaffRole } from '@/lib/auth/authorization'
import { createAdminClient } from '@/lib/supabase/admin'

const allowed: StaffRole[] = ['super_admin','catalog_admin','order_admin','content_admin','marketing_admin','ads_admin','support_admin','analytics_admin','operations_admin']
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function updateAdminRole(formData: FormData) {
  const { user: actor } = await requireRole(['super_admin'])
  const userId = String(formData.get('userId') || '')
  const role = String(formData.get('role') || '') as StaffRole
  const active = formData.get('active') !== 'false'
  if (!uuid.test(userId) || !allowed.includes(role)) redirect('/admin/team?error=invalid')

  const supabase = createAdminClient()
  const { data: target, error: targetError } = await supabase.from('profiles').select('id,role,is_active').eq('id',userId).maybeSingle()
  if (targetError || !target || target.role === 'customer') redirect('/admin/team?error=failed')

  // Never allow an administrator action to leave the system without an active Super Admin.
  if (target.role === 'super_admin' && target.is_active && (role !== 'super_admin' || !active)) {
    const { count } = await supabase.from('profiles').select('id',{count:'exact',head:true}).eq('role','super_admin').eq('is_active',true)
    if ((count ?? 0) <= 1) redirect('/admin/team?error=last_admin')
  }

  // A Super Admin may change other staff, but cannot accidentally lock themselves out.
  if (userId === actor.id && (role !== 'super_admin' || !active)) redirect('/admin/team?error=self_lockout')

  const { error } = await supabase.from('profiles').update({ role, is_active: active, updated_at: new Date().toISOString() }).eq('id',userId)
  if (error) redirect('/admin/team?error=failed')

  await supabase.from('admin_audit_logs').insert({
    actor_id: actor.id,
    actor_role: 'super_admin',
    action: 'UPDATE_STAFF_ACCESS',
    resource_type: 'profile',
    resource_id: userId,
    metadata: { role, is_active: active },
  })

  revalidatePath('/admin')
  revalidatePath('/admin/team')
  redirect('/admin/team?saved=1')
}
