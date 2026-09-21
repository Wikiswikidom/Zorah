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

type StaffAccess = { role: StaffRole | string; is_active: boolean }
const STAFF_ROLES = new Set<StaffRole>(['super_admin','catalog_admin','order_admin','content_admin','marketing_admin','ads_admin','support_admin','analytics_admin','operations_admin'])

export async function getAuthenticatedUser(){
  const supabase=await createClient()
  const {data,error}=await supabase.auth.getUser()
  if(error||!data.user)return null
  return data.user
}

function adminDenied(next='/admin'){redirect(`/admin-access-denied?next=${encodeURIComponent(next)}`)}

async function getStaffAccess() {
  const supabase = await createClient()
  const {data:userData,error:userError}=await supabase.auth.getUser()
  const user=userData.user
  if(userError||!user)return {supabase,user:null,access:null}
  const {data:accessData,error:accessError}=await supabase.from('profiles').select('role,is_active').eq('id',user.id).maybeSingle()
  return {supabase,user,access:accessError?null:accessData as StaffAccess|null}
}

async function hasAAL2(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {data,error}=await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  return !error && data?.currentLevel === 'aal2'
}

export async function requireStaff(){
  const {supabase,user,access}=await getStaffAccess()
  if(!user){redirect(`/admin-login?next=${encodeURIComponent('/admin')}`);throw new Error('Authentication redirect did not complete')}
  if(!access?.is_active||!STAFF_ROLES.has(access.role as StaffRole)){adminDenied('/admin');throw new Error('Authorization redirect did not complete')}
  if(!(await hasAAL2(supabase))){redirect(`/admin-mfa?next=${encodeURIComponent('/admin')}`);throw new Error('MFA redirect did not complete')}
  return {user,role:access.role as StaffRole}
}

export async function requireRole(allowedRoles:StaffRole[]){
  const {user,role}=await requireStaff()
  if(!allowedRoles.includes(role)&&role!=='super_admin'){adminDenied('/admin');throw new Error('Authorization redirect did not complete')}
  return {user,role}
}

export async function requireApiRole(allowedRoles: StaffRole[]) {
  const {supabase,user,access}=await getStaffAccess()
  if (!user) return { ok: false as const, status: 401 as const, error: 'Authentication required.' }
  if (!access?.is_active || !STAFF_ROLES.has(access.role as StaffRole)) {
    return { ok: false as const, status: 403 as const, error: 'Staff access required.' }
  }
  if (!(await hasAAL2(supabase))) {
    return { ok: false as const, status: 403 as const, error: 'Multi-factor authentication is required for staff access.' }
  }
  const role = access.role as StaffRole
  if (role !== 'super_admin' && !allowedRoles.includes(role)) {
    return { ok: false as const, status: 403 as const, error: 'You do not have permission for this operation.' }
  }
  return { ok: true as const, user, role }
}
