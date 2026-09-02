import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  await requireRole(['catalog_admin', 'content_admin', 'marketing_admin'])
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('admin_process_scheduled_content')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ processed: data ?? 0 })
}
