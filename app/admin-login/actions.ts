'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { StaffRole } from '@/lib/auth/authorization'

const staffRoles = new Set<StaffRole>(['super_admin','catalog_admin','order_admin','content_admin','marketing_admin','ads_admin','support_admin','analytics_admin','operations_admin'])
type StaffAccess = { is_active: boolean; role: StaffRole | string }

function safeNext(value: FormDataEntryValue | null) {
  const next = String(value || '/admin')
  return next.startsWith('/') && !next.startsWith('//') ? next : '/admin'
}

export async function adminPasswordSignIn(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')
  const next = safeNext(formData.get('next'))
  if (!email || !password) redirect(`/admin-login?error=missing&next=${encodeURIComponent(next)}`)

  const supabase = await createClient()
  const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect(`/admin-login?error=${encodeURIComponent(error.message.includes('Email not confirmed') ? 'not_staff_verified' : 'invalid')}&next=${encodeURIComponent(next)}`)

  const user = signInData.user
  if (!user) redirect(`/admin-login?error=invalid&next=${encodeURIComponent(next)}`)

  // The profile is security-sensitive. Read it with the server-only admin client
  // after Supabase Auth has authenticated the user. Never expose this client or
  // its service-role key to the browser.
  const admin = createAdminClient()
  const { data: accessData, error: accessError } = await admin
    .from('profiles')
    .select('role,is_active')
    .eq('id', user.id)
    .maybeSingle()
  const access = accessData as StaffAccess | null
  if (accessError || !access?.is_active || !staffRoles.has(access.role as StaffRole)) {
    await supabase.auth.signOut()
    redirect(`/admin-login?error=not_staff&next=${encodeURIComponent(next)}`)
  }

  redirect(next)
}
