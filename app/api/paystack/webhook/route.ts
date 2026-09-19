import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyPaystackSignature, verifyPaystackTransaction } from '@/lib/payments/paystack'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function text(value: unknown, max = 160) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  if (!verifyPaystackSignature(rawBody, request.headers.get('x-paystack-signature'))) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 })
  }

  let event: Record<string, unknown>
  try {
    event = JSON.parse(rawBody) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const eventType = text(event.event, 100)
  const data = (event.data && typeof event.data === 'object' ? event.data : {}) as Record<string, unknown>
  const transaction = (data.transaction && typeof data.transaction === 'object' ? data.transaction : {}) as Record<string, unknown>
  const reference = text(data.reference || data.transaction_reference || transaction.reference, 100)
  const refundReference = text(data.refund_reference, 100)
  const transactionId = Number(data.id || transaction.id)
  const eventIdentity = refundReference || (
    Number.isSafeInteger(transactionId) && transactionId > 0
      ? String(transactionId)
      : reference || crypto.createHash('sha256').update(rawBody).digest('hex')
  )
  const eventKey = `${eventType || 'unknown'}:${eventIdentity}`
  const admin = createAdminClient()

  // Claim each signed event exactly once. Failed/received events can be reclaimed
  // after an interrupted attempt; an already-processing event is left for the
  // current worker to finish, while processed/ignored events are terminal.
  const { error: eventInsertError } = await admin.from('payment_webhook_events').insert({
    event_key: eventKey,
    event_type: eventType || 'unknown',
    reference: reference || null,
    transaction_id: Number.isSafeInteger(transactionId) && transactionId > 0 ? transactionId : null,
    payload: event,
    status: 'received',
  })

  if (eventInsertError && eventInsertError.code !== '23505') {
    console.error('Webhook event persistence failed', eventInsertError)
    return NextResponse.json({ error: 'Could not persist webhook event.' }, { status: 500 })
  }

  if (eventInsertError?.code === '23505') {
    const { data: existing } = await admin
      .from('payment_webhook_events')
      .select('status,created_at')
      .eq('event_key', eventKey)
      .maybeSingle()

    if (existing?.status === 'processed' || existing?.status === 'ignored') {
      return NextResponse.json({ received: true, duplicate: true })
    }

    if (existing?.status === 'processing') {
      const createdAt = existing.created_at ? new Date(existing.created_at).getTime() : 0
      if (createdAt > Date.now() - 10 * 60_000) {
        return NextResponse.json({ received: true, duplicate: true })
      }
      await admin
        .from('payment_webhook_events')
        .update({ status: 'failed', error_message: 'Stale processing claim reclaimed.' })
        .eq('event_key', eventKey)
        .eq('status', 'processing')
    }

    const { data: reclaimed } = await admin
      .from('payment_webhook_events')
      .update({ status: 'processing', error_message: null })
      .eq('event_key', eventKey)
      .in('status', ['received', 'failed'])
      .select('id')
      .maybeSingle()

    if (!reclaimed) return NextResponse.json({ received: true, duplicate: true })
  } else {
    const { data: claimed } = await admin
      .from('payment_webhook_events')
      .update({ status: 'processing' })
      .eq('event_key', eventKey)
      .eq('status', 'received')
      .select('id')
      .maybeSingle()

    if (!claimed) return NextResponse.json({ received: true, duplicate: true })
  }

  try {
    if (eventType === 'charge.success' && reference) {
      const verification = await verifyPaystackTransaction(reference)
      const payment = verification.data
      const { data: order } = await admin
        .from('orders')
        .select('id,order_number,user_id,total,currency')
        .eq('order_number', reference)
        .maybeSingle()

      if (!order) {
        await admin.from('payment_webhook_events')
          .update({ status: 'ignored', processed_at: new Date().toISOString() })
          .eq('event_key', eventKey)
        return NextResponse.json({ received: true })
      }

      const expectedAmount = Math.round(Number(order.total) * 100)
      const valid =
        verification.ok &&
        payment?.status === 'success' &&
        payment.reference === reference &&
        Number(payment.amount) === expectedAmount &&
        payment.currency === order.currency

      if (!valid) throw new Error('Webhook transaction did not match the stored order.')

      const { error: finalizeError } = await admin.rpc('finalize_paid_order', {
        p_order_id: order.id,
        p_reference: reference,
        p_amount: order.total,
        p_currency: order.currency,
        p_channel: typeof payment.channel === 'string' ? payment.channel : null,
      })
      if (finalizeError) throw new Error(finalizeError.message || 'Paid order could not be finalized.')

      await admin.from('payments').update({
        transaction_id: payment.id ?? null,
        status: 'paid',
        paid_at: payment.paid_at || new Date().toISOString(),
        metadata: {
          source: 'webhook',
          channel: payment.channel ?? null,
          gateway_response: payment.gateway_response ?? null,
        },
      }).eq('reference', reference)
    }

    if (eventType.startsWith('refund.') && reference) {
      const refundStatus = text(data.status, 40) || eventType.replace('refund.', '')
      const amountMinor = Number(data.amount)
      const { data: payment } = await admin
        .from('payments')
        .select('id,order_id,amount,refunded_amount')
        .eq('reference', reference)
        .maybeSingle()

      if (!payment) throw new Error('Refund webhook does not match a stored payment.')

      const currentRefunded = Number(payment.refunded_amount || 0)
      const originalAmount = Number(payment.amount)
      const update: Record<string, unknown> = {
        refund_status: refundStatus,
        refund_reference: refundReference || null,
      }

      // Do not count a refund as money returned until Paystack says the refund
      // is processed. This prevents pending -> processed webhooks from double
      // counting a refund already recorded by the admin action.
      if (refundStatus === 'processed') {
        if (!Number.isFinite(amountMinor) || amountMinor <= 0) {
          throw new Error('Processed refund webhook has an invalid amount.')
        }
        const refundAmount = amountMinor / 100
        if (!Number.isFinite(originalAmount) || currentRefunded + refundAmount > originalAmount) {
          throw new Error('Processed refund exceeds the stored payment amount.')
        }

        const newRefundedAmount = currentRefunded + refundAmount
        update.refunded_amount = newRefundedAmount
        update.refunded_at = new Date().toISOString()
        update.status = 'refunded'

        const { data: updatedPayment, error: updateError } = await admin
          .from('payments')
          .update(update)
          .eq('id', payment.id)
          .select('id,order_id,amount,refunded_amount')
          .maybeSingle()

        if (updateError) throw updateError

        if (updatedPayment?.order_id) {
          const fullyRefunded = Number(updatedPayment.refunded_amount || 0) >= Number(updatedPayment.amount || 0)
          await admin.from('orders').update({
            payment_status: fullyRefunded ? 'refunded' : 'paid',
            status: fullyRefunded ? 'refunded' : 'processing',
          }).eq('id', updatedPayment.order_id)
        }
      } else {
        await admin.from('payments').update(update).eq('id', payment.id)
      }
    }

    await admin.from('payment_webhook_events')
      .update({ status: 'processed', processed_at: new Date().toISOString(), error_message: null })
      .eq('event_key', eventKey)

    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook processing failed.'
    console.error('Paystack webhook processing failed', error)
    await admin.from('payment_webhook_events')
      .update({ status: 'failed', error_message: message.slice(0, 500) })
      .eq('event_key', eventKey)
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 })
  }
}
