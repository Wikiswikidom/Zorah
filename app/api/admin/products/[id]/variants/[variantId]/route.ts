import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createClient } from '@/lib/supabase/server'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SKU = /^[A-Z0-9][A-Z0-9._-]{2,63}$/

function validate(body: Record<string, unknown>) {
  const sku = typeof body.sku === 'string' ? body.sku.trim().toUpperCase() : ''
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : null
  const colorName = typeof body.color_name === 'string' ? body.color_name.trim().slice(0, 60) : null
  const colorHex = typeof body.color_hex === 'string' ? body.color_hex.trim() : null
  const price = Number(body.price); const stock = Number(body.stock_quantity)
  if (!SKU.test(sku)) return { error: 'Invalid SKU.' }
  if (!Number.isFinite(price) || price < 0 || price > 1_000_000_000) return { error: 'Invalid price.' }
  if (!Number.isInteger(stock) || stock < 0 || stock > 1_000_000) return { error: 'Invalid stock quantity.' }
  if (colorHex && !/^#[0-9a-f]{6}$/i.test(colorHex)) return { error: 'Invalid colour code.' }
  return { sku, name, colorName, colorHex, price, stock, isAvailable: body.is_available !== false, isDefault: body.is_default === true }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; variantId: string }> }) {
  await requireRole(['catalog_admin'])
  const { id, variantId } = await params
  if (!UUID.test(id) || !UUID.test(variantId)) return NextResponse.json({ error: 'Invalid identifier.' }, { status: 400 })
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  const v = validate(body as Record<string, unknown>); if ('error' in v) return NextResponse.json(v, { status: 400 })
  const supabase = await createClient()
  const { data: existing } = await supabase.from('product_variants').select('id').eq('id', variantId).eq('product_id', id).single()
  if (!existing) return NextResponse.json({ error: 'Variant not found.' }, { status: 404 })
  if (v.isDefault) await supabase.from('product_variants').update({ is_default: false }).eq('product_id', id).neq('id', variantId)
  const { data, error } = await supabase.from('product_variants').update({ sku:v.sku, name:v.name, color_name:v.colorName, color_hex:v.colorHex, price:v.price, stock_quantity:v.stock, is_available:v.isAvailable, is_default:v.isDefault }).eq('id', variantId).eq('product_id', id).select('id,product_id,sku,name,color_name,color_hex,price,stock_quantity,is_available,is_default').single()
  if (error) return NextResponse.json({ error: error.code === '23505' ? 'That SKU is already in use.' : 'Could not update variant.' }, { status: error.code === '23505' ? 409 : 400 })
  return NextResponse.json({ variant: data })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; variantId: string }> }) {
  await requireRole(['catalog_admin'])
  const { id, variantId } = await params
  if (!UUID.test(id) || !UUID.test(variantId)) return NextResponse.json({ error: 'Invalid identifier.' }, { status: 400 })
  const supabase = await createClient()
  const { error } = await supabase.from('product_variants').delete().eq('id', variantId).eq('product_id', id)
  if (error) return NextResponse.json({ error: 'Could not remove variant.' }, { status: 400 })
  return NextResponse.json({ ok: true })
}
