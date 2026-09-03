import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type StaffRole =
  | 'super_admin'
  | 'catalog_admin'
  | 'order_admin'
  | 'content_admin'
  | 'marketing_admin'
  | 'ads_admin'
  | 'support_admin'
  | 'analytics_admin'
  | 'operations_admin'

const STAFF_ROLES = new Set<StaffRole>([
  'super_admin','catalog_admin','order_admin','content_admin','marketing_admin','ads_admin','support_admin','analytics_admin','operations_admin',
])

type StaffAccess = { role: StaffRole | string; is_active: boolean }

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
    redirect('/admin-login?next=/admin')
    throw new Error('Authentication redirect did not complete')
  }

  // Read only the caller's own profile. RLS keeps privileged role data protected.
  const { data: accessData, error: accessError } = await supabase
    .from('profiles')
    .select('role,is_active')
    .eq('id', user.id)
    .maybeSingle()
  const access = accessData as StaffAccess | null
  if (accessError || !access?.is_active || !STAFF_ROLES.has(access.role as StaffRole)) {
    redirect('/admin-login?error=forbidden&next=/admin')
    throw new Error('Authorization redirect did not complete')
  }
  return { user, role: access.role as StaffRole }
}

export async function requireRole(allowedRoles: StaffRole[]) {
  const { user, role } = await requireStaff()
  if (!allowedRoles.includes(role) && role !== 'super_admin') {
    redirect('/admin-login?error=forbidden&next=/admin')
    throw new Error('Authorization redirect did not complete')
  }
  return { user, role }
}
