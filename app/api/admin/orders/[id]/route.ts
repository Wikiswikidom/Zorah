import { NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/auth/authorization'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const allowedStatuses = ['pending','paid','processing','shipped','delivered','cancelled','refunded'] as const
type OrderStatus = typeof allowedStatuses[number]

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireApiRole(['order_admin'])
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { id } = await params
    const admin = createAdminClient()
    const { data: order, error } = await admin.from('orders').select('id,order_number,user_id,customer_name,email,phone,address_line1,address_line2,city,state,country,subtotal,delivery_fee,total,currency,status,payment_status,paystack_reference,created_at,updated_at,customer_note,terms_accepted_at,terms_version,tracking_number,carrier,shipped_at,delivered_at,cancelled_at,admin_note').eq('id', id).maybeSingle()
    if (error) throw error
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
    const [{ data: items, error: itemsError }, { data: history, error: historyError }, { data: payment, error: paymentError }] = await Promise.all([
      admin.from('order_items').select('id,product_id,variant_id,product_name,variant_name,quantity,unit_price,line_total').eq('order_id', id).order('created_at'),
      admin.from('order_status_history').select('id,status,note,created_by,created_at').eq('order_id', id).order('created_at', { ascending: false }),
      admin.from('payments').select('id,provider,reference,amount,currency,status,transaction_id,refunded_amount,refund_reference,refund_status,paid_at,refunded_at,created_at,updated_at').eq('order_id', id).maybeSingle()
    ])
    if (itemsError || historyError || paymentError) throw itemsError || historyError || paymentError
    return NextResponse.json({ order, items: items ?? [], history: history ?? [], payment: payment ?? null })
  } catch (error) {
    console.error('Admin order detail GET failed', error)
    return NextResponse.json({ error: 'Unable to load this order.' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireApiRole(['order_admin'])
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { user } = auth
    const { id } = await params
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid order update.' }, { status: 400 })
    const input = body as Record<string, unknown>
    const admin = createAdminClient()
    const { data: before, error: readError } = await admin.from('orders').select('id,order_number,status,payment_status,tracking_number,carrier,shipped_at,delivered_at,cancelled_at,admin_note').eq('id', id).maybeSingle()
    if (readError) throw readError
    if (!before) return NextResponse.json({ error: 'Order not found.' }, { status: 404 })

    const requestedStatus = typeof input.status === 'string' ? input.status : null
    if (requestedStatus === 'cancelled' && before.status !== 'cancelled') {
      const note = typeof input.note === 'string' ? input.note.trim().slice(0, 1000) || null : null
      const { data: cancelled, error: cancelError } = await admin.rpc('cancel_order_and_restock', { p_order_id: id, p_actor_id: user.id, p_note: note })
      if (cancelError) throw cancelError
      await admin.from('admin_audit_logs').insert({ actor_id: user.id, actor_role: 'order_admin', action: 'UPDATE', resource_type: 'order', resource_id: id, result: 'success', before_data: before, after_data: cancelled, metadata: { changed_fields: ['status','cancelled_at'], restocked: before.payment_status === 'paid' } })
      return NextResponse.json({ order: cancelled })
    }

    const patch: Record<string, unknown> = {}
    if (requestedStatus) {
      if (!allowedStatuses.includes(requestedStatus as OrderStatus)) return NextResponse.json({ error: 'Unsupported order status.' }, { status: 400 })
      const next = requestedStatus as OrderStatus
      const current = before.status as OrderStatus
      const transitions: Record<OrderStatus, OrderStatus[]> = { pending:['paid','processing','cancelled'], paid:['processing','cancelled','refunded'], processing:['shipped','cancelled'], shipped:['delivered'], delivered:[], cancelled:[], refunded:[] }
      if (next !== current && !transitions[current]?.includes(next)) return NextResponse.json({ error: `Cannot move an order from ${current} to ${next}.` }, { status: 409 })
      if (next === 'paid' && before.payment_status !== 'paid') return NextResponse.json({ error: 'An order can only be marked paid after its payment is confirmed.' }, { status: 409 })
      if (['processing','shipped','delivered'].includes(next) && before.payment_status !== 'paid') return NextResponse.json({ error: 'Only paid orders can be fulfilled.' }, { status: 409 })
      if (next === 'refunded') return NextResponse.json({ error: 'Use the payment refund action to mark an order refunded.' }, { status: 409 })
      patch.status = next
      if (next === 'shipped') patch.shipped_at = new Date().toISOString()
      if (next === 'delivered') patch.delivered_at = new Date().toISOString()
    }

    for (const key of ['tracking_number','carrier','admin_note'] as const) {
      if (key in input) {
        const value = typeof input[key] === 'string' ? input[key].trim() : ''
        if (value.length > 1000) return NextResponse.json({ error: `${key} is too long.` }, { status: 400 })
        patch[key] = value || null
      }
    }
    if (!Object.keys(patch).length) return NextResponse.json({ error: 'No changes supplied.' }, { status: 400 })
    patch.updated_at = new Date().toISOString()
    const { data: updated, error: updateError } = await admin.from('orders').update(patch).eq('id', id).select('id,order_number,status,payment_status,tracking_number,carrier,shipped_at,delivered_at,cancelled_at,admin_note,updated_at').single()
    if (updateError) throw updateError
    if (requestedStatus && requestedStatus !== before.status) await admin.from('order_status_history').insert({ order_id: id, status: requestedStatus, note: typeof input.note === 'string' ? input.note.trim().slice(0, 1000) || null : null, created_by: user.id })
    await admin.from('admin_audit_logs').insert({ actor_id: user.id, actor_role: 'order_admin', action: 'UPDATE', resource_type: 'order', resource_id: id, result: 'success', before_data: before, after_data: updated, metadata: { changed_fields: Object.keys(patch).filter(key => key !== 'updated_at') } })
    return NextResponse.json({ order: updated })
  } catch (error) {
    console.error('Admin order detail PATCH failed', error)
    return NextResponse.json({ error: 'Unable to update this order.' }, { status: 500 })
  }
}
