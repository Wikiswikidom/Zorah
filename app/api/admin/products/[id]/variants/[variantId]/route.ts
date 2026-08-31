import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createClient } from '@/lib/supabase/server'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; variantId: string }> }) {
  await requireRole(['catalog_admin'])
  const { id, variantId } = await params
  if (!UUID.test(id) || !UUID.test(variantId)) return NextResponse.json({ error: 'Invalid identifier.' }, { status: 400 })
  const supabase = await createClient()
  const { error } = await supabase.from('product_variants').delete().eq('id', variantId).eq('product_id', id)
  if (error) return NextResponse.json({ error: 'Could not remove variant.' }, { status: 400 })
  return NextResponse.json({ ok: true })
}
