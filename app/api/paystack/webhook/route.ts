import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyPaystackSignature, verifyPaystackTransaction } from '@/lib/payments/paystack'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function text(value: unknown, max = 160) { return typeof value === 'string' ? value.trim().slice(0, max) : '' }

export async function POST(request: Request) {
  const rawBody = await request.text()
  if (!verifyPaystackSignature(rawBody, request.headers.get('x-paystack-signature'))) return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 })
  let event: Record<string, unknown>
  try { event = JSON.parse(rawBody) as Record<string, unknown> } catch { return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 }) }

  const eventType = text(event.event, 100)
  const data = (event.data && typeof event.data === 'object' ? event.data : {}) as Record<string, unknown>
  const transaction = (data.transaction && typeof data.transaction === 'object' ? data.transaction : {}) as Record<string, unknown>
  const reference = text(data.reference || data.transaction_reference || transaction.reference, 100)
  const transactionId = Number(data.id || transaction.id)
  const eventKey = `${eventType}:${Number.isSafeInteger(transactionId) && transactionId > 0 ? transactionId : reference || crypto.createHash('sha256').update(rawBody).digest('hex')}`
  const admin = createAdminClient()

  const { error: eventInsertError } = await admin.from('payment_webhook_events').insert({ event_key: eventKey, event_type: eventType || 'unknown', reference: reference || null, transaction_id: Number.isSafeInteger(transactionId) && transactionId > 0 ? transactionId : null, payload: event, status: 'received' })
  if (eventInsertError) {
    if (eventInsertError.code === '23505') return NextResponse.json({ received: true, duplicate: true })
    console.error('Webhook event persistence failed', eventInsertError)
    return NextResponse.json({ error: 'Could not persist webhook event.' }, { status: 500 })
  }

  try {
    if (eventType === 'charge.success' && reference) {
      const verification = await verifyPaystackTransaction(reference)
      const payment = verification.data
      const { data: order } = await admin.from('orders').select('id,order_number,user_id,total,currency').eq('order_number', reference).maybeSingle()
      if (!order) {
        await admin.from('payment_webhook_events').update({ status: 'ignored', processed_at: new Date().toISOString() }).eq('event_key', eventKey)
        return NextResponse.json({ received: true })
      }
      const expectedAmount = Math.round(Number(order.total) * 100)
      const valid = verification.ok && payment?.status === 'success' && payment.reference === reference && Number(payment.amount) === expectedAmount && payment.currency === order.currency
      if (!valid) throw new Error('Webhook transaction did not match the stored order.')
      const { error: finalizeError } = await admin.rpc('finalize_paid_order', { p_order_id: order.id, p_reference: reference, p_amount: order.total, p_currency: order.currency, p_channel: typeof payment.channel === 'string' ? payment.channel : null })
      if (finalizeError) throw new Error(finalizeError.message || 'Paid order could not be finalized.')
      await admin.from('payments').update({ transaction_id: payment.id ?? null, status: 'paid', paid_at: payment.paid_at || new Date().toISOString(), metadata: { source: 'webhook', channel: payment.channel ?? null, gateway_response: payment.gateway_response ?? null } }).eq('reference', reference)
    }

    if (eventType.startsWith('refund.') && reference) {
      const refundStatus = text(data.status, 40) || eventType.replace('refund.', '')
      const refundReference = text(data.refund_reference, 100)
      const amountMinor = Number(data.amount)
      const { data: payment } = await admin.from('payments').select('id,refunded_amount').eq('reference', reference).maybeSingle()
      const currentRefunded = Number(payment?.refunded_amount || 0)
      const update: Record<string, unknown> = { refund_status: refundStatus, refund_reference: refundReference || null }
      if (Number.isFinite(amountMinor) && amountMinor >= 0) update.refunded_amount = currentRefunded + amountMinor / 100
      if (refundStatus === 'processed') { update.refunded_at = new Date().toISOString(); update.status = 'refunded' }
      const { data: updatedPayment } = await admin.from('payments').update(update).eq('reference', reference).select('id,order_id,status').maybeSingle()
      if (refundStatus === 'processed' && updatedPayment?.order_id) await admin.from('orders').update({ payment_status: 'refunded', status: 'refunded' }).eq('id', updatedPayment.order_id)
    }

    await admin.from('payment_webhook_events').update({ status: 'processed', processed_at: new Date().toISOString() }).eq('event_key', eventKey)
    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook processing failed.'
    console.error('Paystack webhook processing failed', error)
    await admin.from('payment_webhook_events').update({ status: 'failed', error_message: message.slice(0, 500) }).eq('event_key', eventKey)
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 })
  }
}
