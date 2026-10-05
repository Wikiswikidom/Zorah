'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth/authorization'
import { createAdminClient } from '@/lib/supabase/admin'

export async function markWaitlistContacted(formData: FormData) {
  await requireRole(['support_admin'])
  const id = String(formData.get('id') ?? '')
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect('/admin/waitlist?error=invalid')

  const supabase = createAdminClient()
  const { data: existing, error: lookupError } = await supabase
    .from('product_waitlists')
    .select('id,status')
    .eq('id', id)
    .maybeSingle()

  if (lookupError || !existing) redirect('/admin/waitlist?error=lookup_failed')
  if (existing.status === 'contacted') redirect('/admin/waitlist?message=already_contacted')

  const { error } = await supabase
    .from('product_waitlists')
    .update({ status: 'contacted' })
    .eq('id', id)

  if (error) redirect('/admin/waitlist?error=update_failed')
  revalidatePath('/admin/waitlist')
  revalidatePath('/admin')
  redirect('/admin/waitlist?message=contacted')
}
