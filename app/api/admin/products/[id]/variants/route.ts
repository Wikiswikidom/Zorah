import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createClient } from '@/lib/supabase/server'

const SKU = /^[A-Z0-9][A-Z0-9._-]{2,63}$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireRole(['catalog_admin'])
  const { id } = await params
  if (!UUID.test(id)) return NextResponse.json({ error: 'Invalid product.' }, { status: 400 })
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  const sku = typeof body.sku === 'string' ? body.sku.trim().toUpperCase() : ''
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : null
  const colorName = typeof body.color_name === 'string' ? body.color_name.trim().slice(0, 60) : typeof body.color === 'string' ? body.color.trim().slice(0, 60) : null
  const colorHex = typeof body.color_hex === 'string' ? body.color_hex.trim() : null
  const price = Number(body.price)
  const stock = Number(body.stock_quantity)
  const isAvailable = body.is_available !== false
  const isDefault = body.is_default === true
  if (!SKU.test(sku)) return NextResponse.json({ error: 'Invalid SKU.' }, { status: 400 })
  if (!Number.isFinite(price) || price < 0 || price > 1_000_000_000) return NextResponse.json({ error: 'Invalid price.' }, { status: 400 })
  if (!Number.isInteger(stock) || stock < 0 || stock > 1_000_000) return NextResponse.json({ error: 'Invalid stock quantity.' }, { status: 400 })
  if (colorHex && !/^#[0-9a-f]{6}$/i.test(colorHex)) return NextResponse.json({ error: 'Invalid colour code.' }, { status: 400 })
  const supabase = await createClient()
  const { data: product } = await supabase.from('products').select('id').eq('id', id).single()
  if (!product) return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
  if (isDefault) await supabase.from('product_variants').update({ is_default: false }).eq('product_id', id)
  const { data, error } = await supabase.from('product_variants').insert({ product_id: id, sku, name, color_name: colorName, color_hex: colorHex, price, stock_quantity: stock, is_available: isAvailable, is_default: isDefault }).select('id,product_id,sku,name,color_name,color_hex,price,stock_quantity,is_available,is_default').single()
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'That SKU is already in use.' }, { status: 409 })
    return NextResponse.json({ error: 'Could not create variant.' }, { status: 400 })
  }
  return NextResponse.json({ variant: data }, { status: 201 })
}
