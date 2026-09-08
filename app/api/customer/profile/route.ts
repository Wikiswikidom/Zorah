import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const normalizePhone = (value: unknown) => {
  if (typeof value !== 'string') return ''
  return value.trim().replace(/\s+/g, ' ').slice(0, 30)
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('full_name,phone')
    .eq('id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: 'Could not load profile' }, { status: 500 })
  return NextResponse.json({
    profile: profile || { full_name: user.user_metadata?.full_name || '', phone: user.user_metadata?.phone || '' },
    email: user.email || '',
  })
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const full_name = typeof body?.full_name === 'string' ? body.full_name.trim().replace(/\s+/g, ' ').slice(0, 120) : ''
  const phone = normalizePhone(body?.phone)
  if (!full_name) return NextResponse.json({ error: 'Full name is required' }, { status: 400 })

  const { data: profile, error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, full_name, phone: phone || null, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    .select('full_name,phone')
    .single()

  if (error) {
    console.error('Profile update failed', error)
    return NextResponse.json({ error: 'Could not save profile details' }, { status: 500 })
  }

  // Keep non-sensitive display metadata in Auth aligned with the profile.
  const { error: metadataError } = await supabase.auth.updateUser({
    data: { full_name, phone: phone || null },
  })
  if (metadataError) console.error('Auth metadata update failed', metadataError)

  return NextResponse.json({ profile, email: user.email || '' })
}
