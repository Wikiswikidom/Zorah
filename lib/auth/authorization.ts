import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type StaffRole =
  | 'super_admin'
  | 'catalog_admin'
  | 'order_admin'
  | 'content_admin'
  | 'marketing_admin'
  | 'support_admin'
  | 'analytics_admin'

const STAFF_ROLES = new Set<StaffRole>([
  'super_admin',
  'catalog_admin',
  'order_admin',
  'content_admin',
  'marketing_admin',
  'support_admin',
  'analytics_admin',
])

export async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return data.user
}

export async function requireStaff() {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  const user = userData.user

  if (userError || !user) {
    redirect('/login?next=/admin')
    throw new Error('Authentication redirect did not complete')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || !profile.is_active || !STAFF_ROLES.has(profile.role as StaffRole)) {
    redirect('/?error=forbidden')
    throw new Error('Authorization redirect did not complete')
  }

  return { user, role: profile.role as StaffRole }
}

export async function requireRole(allowedRoles: StaffRole[]) {
  const { user, role } = await requireStaff()
  if (!allowedRoles.includes(role) && role !== 'super_admin') {
    redirect('/?error=forbidden')
    throw new Error('Authorization redirect did not complete')
  }
  return { user, role }
}
