'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/auth/authorization'

export async function updateAdminPassword(formData: FormData){
  await requireStaff()
  const password=String(formData.get('password')||'')
  const confirm=String(formData.get('confirmPassword')||'')
  if(password.length<12||password.length>128||password!==confirm) redirect('/admin/security?error=invalid')
  const supabase=await createClient()
  const {error}=await supabase.auth.updateUser({password})
  if(error) redirect('/admin/security?error=failed')
  redirect('/admin/security?message=updated')
}
