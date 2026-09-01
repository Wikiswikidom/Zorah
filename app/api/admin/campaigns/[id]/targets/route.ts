import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createClient } from '@/lib/supabase/server'

const uuid = (value: unknown) => typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value)
const jsonError = (message: string, status = 400) => NextResponse.json({ error: message }, { status })

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(['marketing_admin', 'content_admin'])
    const { id } = await params
    if (!uuid(id)) return jsonError('Invalid campaign ID.')
    const supabase = await createClient()
    const [{ data: products }, { data: collections }] = await Promise.all([
      supabase.from('campaign_products').select('product_id,sort_order,products(id,name,slug,status)').eq('campaign_id', id).order('sort_order'),
      supabase.from('campaign_collections').select('collection_id,sort_order,collections(id,name,slug,status)').eq('campaign_id', id).order('sort_order'),
    ])
    return NextResponse.json({ products: products ?? [], collections: collections ?? [] })
  } catch { return jsonError('Unable to load campaign targets.', 500) }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireRole(['marketing_admin'])
    const { id } = await params
    if (!uuid(id) || !user?.id) return jsonError('Invalid campaign or authentication.', 401)
    if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) return jsonError('JSON request required.', 415)
    let body: unknown
    try { body = await request.json() } catch { return jsonError('Invalid JSON request.') }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return jsonError('Invalid target payload.')
    const b = body as Record<string, unknown>
    const productIds = Array.isArray(b.product_ids) ? b.product_ids.filter(uuid) : []
    const collectionIds = Array.isArray(b.collection_ids) ? b.collection_ids.filter(uuid) : []
    if (productIds.length > 100 || collectionIds.length > 100) return jsonError('Too many campaign targets.')
    const supabase = await createClient()
    const { data: campaign } = await supabase.from('campaigns').select('id,campaign_type').eq('id', id).maybeSingle()
    if (!campaign) return jsonError('Campaign not found.', 404)
    if (productIds.length) {
      const { data: valid } = await supabase.from('products').select('id').in('id', productIds)
      if ((valid?.length ?? 0) !== productIds.length) return jsonError('One or more products are invalid.')
    }
    if (collectionIds.length) {
      const { data: valid } = await supabase.from('collections').select('id').in('id', collectionIds)
      if ((valid?.length ?? 0) !== collectionIds.length) return jsonError('One or more collections are invalid.')
    }
    const { error: deleteProductsError } = await supabase.from('campaign_products').delete().eq('campaign_id', id)
    if (deleteProductsError) return jsonError('Could not update product targets.', 400)
    const { error: deleteCollectionsError } = await supabase.from('campaign_collections').delete().eq('campaign_id', id)
    if (deleteCollectionsError) return jsonError('Could not update collection targets.', 400)
    if (productIds.length) {
      const { error } = await supabase.from('campaign_products').insert(productIds.map((product_id, sort_order) => ({ campaign_id: id, product_id, sort_order })))
      if (error) return jsonError('Could not save product targets.', 400)
    }
    if (collectionIds.length) {
      const { error } = await supabase.from('campaign_collections').insert(collectionIds.map((collection_id, sort_order) => ({ campaign_id: id, collection_id, sort_order })))
      if (error) return jsonError('Could not save collection targets.', 400)
    }
    await supabase.from('campaigns').update({ updated_by: user.id, updated_at: new Date().toISOString() }).eq('id', id)
    return NextResponse.json({ ok: true, product_count: productIds.length, collection_count: collectionIds.length })
  } catch { return jsonError('Unable to update campaign targets.', 500) }
}
