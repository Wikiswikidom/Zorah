'use server'

import { revalidatePath } from 'next/cache'
import { requireRole, type StaffRole } from '@/lib/auth/authorization'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const allowed: StaffRole[] = ['super_admin','catalog_admin','order_admin','content_admin','marketing_admin','support_admin','analytics_admin','operations_admin']

export async function updateAdminRole(formData: FormData) {
  await requireRole(['super_admin'])
  const userId = String(formData.get('userId') || '')
  const role = String(formData.get('role') || '') as StaffRole
  const active = formData.get('active') !== 'false'
  if (!userId || !allowed.includes(role)) redirect('/admin/team?error=invalid')
  const supabase = await createClient()
  const { error } = await supabase.rpc('admin_set_user_role', { target_user: userId, new_role: role, make_active: active })
  if (error) redirect(`/admin/team?error=${encodeURIComponent(error.message.includes('last active') ? 'last_admin' : 'failed')}`)
  revalidatePath('/admin')
  revalidatePath('/admin/team')
  redirect('/admin/team?saved=1')
}
