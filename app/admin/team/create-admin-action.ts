'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireRole, type StaffRole } from '@/lib/auth/authorization'
import { createAdminClient } from '@/lib/supabase/admin'

const STAFF_ROLES: StaffRole[] = [
  'catalog_admin',
  'order_admin',
  'content_admin',
  'marketing_admin',
  'ads_admin',
  'support_admin',
  'analytics_admin',
  'operations_admin',
]

const text = (value: FormDataEntryValue | null, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

export async function createStaffAccount(formData: FormData) {
  const { user: actor } = await requireRole(['super_admin'])

  const email = text(formData.get('email'), 320).toLowerCase()
  const password = typeof formData.get('password') === 'string' ? String(formData.get('password')) : ''
  const fullName = text(formData.get('fullName'), 160)
  const role = text(formData.get('role'), 40) as StaffRole

  if (!email || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || !STAFF_ROLES.includes(role)) {
    redirect('/admin/team?error=invalid_create')
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: fullName ? { full_name: fullName } : undefined,
  })

  if (error || !data.user) {
    const message = (error?.message ?? '').toLowerCase()
    redirect(`/admin/team?error=${message.includes('already') ? 'email_exists' : 'create_failed'}`)
  }

  const userId = data.user.id
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: fullName || null,
      role,
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (profileError) {
    await supabase.auth.admin.deleteUser(userId)
    redirect('/admin/team?error=profile_failed')
  }

  // Deliberately never record the password in the audit trail, URL, logs, or database.
  await supabase.from('admin_audit_logs').insert({
    actor_id: actor.id,
    actor_role: 'super_admin',
    action: 'CREATE_STAFF_ACCOUNT',
    resource_type: 'auth_user',
    resource_id: userId,
    metadata: { email, role },
  })

  revalidatePath('/admin/team')
  revalidatePath('/admin')
  redirect('/admin/team?saved=created')
}
