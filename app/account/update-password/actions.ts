'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function updatePassword(formData: FormData) {
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')

  if (password.length < 10 || password.length > 1024) {
    redirect('/account/update-password?error=weak')
  }
  if (password !== confirmPassword) {
    redirect('/account/update-password?error=mismatch')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/account/update-password')

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    const message = error.message.toLowerCase()
    if (message.includes('same password') || message.includes('different')) {
      redirect('/account/update-password?error=same')
    }
    redirect('/account/update-password?error=failed')
  }

  revalidatePath('/account', 'page')
  redirect('/account/update-password?message=updated')
}
