'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StaffRole } from '@/lib/auth/authorization'

const staffRoles = new Set<StaffRole>(['super_admin','catalog_admin','order_admin','content_admin','marketing_admin','support_admin','analytics_admin','operations_admin'])

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
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect(`/admin-login?error=${encodeURIComponent(error.message.includes('Email not confirmed') ? 'not_staff_verified' : 'invalid')}&next=${encodeURIComponent(next)}`)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/admin-login?error=invalid&next=${encodeURIComponent(next)}`)

  // Resolve staff access through a narrowly scoped SECURITY DEFINER RPC. This avoids
  // relying on a self-referential RLS policy immediately after authentication while
  // still requiring an authenticated session and an active non-customer role.
  const { data: access, error: accessError } = await supabase.rpc('get_current_staff_access').maybeSingle()
  if (accessError || !access?.is_active || !staffRoles.has(access.role as StaffRole)) {
    await supabase.auth.signOut()
    redirect(`/admin-login?error=not_staff&next=${encodeURIComponent(next)}`)
  }
  redirect(next)
}
