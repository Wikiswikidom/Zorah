import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyPaystackTransaction } from '@/lib/payments/paystack'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { user, role } = await requireRole(['order_admin'])
    const body = await request.json().catch(() => null) as { orderId?: unknown } | null
    const orderId = typeof body?.orderId === 'string' ? body.orderId.trim() : ''
    if (!orderId) return NextResponse.json({ error: 'Order is required.' }, { status: 400 })
    const admin = createAdminClient()
    const { data: order } = await admin.from('orders').select('id,order_number,total,currency,payment_status').eq('id', orderId).maybeSingle()
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
    const reference = order.order_number
    const verification = await verifyPaystackTransaction(reference)
    if (!verification.configured) return NextResponse.json({ error: 'Paystack is not configured.' }, { status: 503 })
    const tx = verification.data
    const valid = verification.ok && tx?.status === 'success' && tx.reference === reference && Number(tx.amount) === Math.round(Number(order.total) * 100) && tx.currency === order.currency
    if (!valid) {
      await admin.from('payments').update({ status: tx?.status === 'abandoned' ? 'abandoned' : 'failed', metadata: { source: 'admin_reconcile', gateway_response: tx?.gateway_response ?? null } }).eq('reference', reference).neq('status', 'paid')
      return NextResponse.json({ paid: false, status: tx?.status || 'unknown' })
    }
    const { error: finalizeError } = await admin.rpc('finalize_paid_order', { p_order_id: order.id, p_reference: reference, p_amount: order.total, p_currency: order.currency, p_channel: typeof tx.channel === 'string' ? tx.channel : null })
    if (finalizeError) throw new Error(finalizeError.message || 'Order could not be finalized.')
    await admin.from('payments').update({ transaction_id: tx.id ?? null, status: 'paid', paid_at: tx.paid_at || new Date().toISOString(), metadata: { source: 'admin_reconcile', channel: tx.channel ?? null, gateway_response: tx.gateway_response ?? null } }).eq('reference', reference)
    await admin.from('admin_audit_logs').insert({ actor_id: user.id, actor_role: role, action: 'UPDATE', resource_type: 'payment_reconciliation', resource_id: order.id, result: 'success', metadata: { reference } })
    return NextResponse.json({ paid: true, status: 'success' })
  } catch (error) {
    console.error('Payment reconciliation failed', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Payment reconciliation failed.' }, { status: 500 })
  }
}
