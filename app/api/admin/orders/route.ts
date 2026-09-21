import { NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/auth/authorization'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const auth = await requireApiRole(['order_admin'])
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const admin = createAdminClient()
    const { data: orders, error } = await admin.from('orders').select('id,order_number,customer_name,email,phone,total,currency,status,payment_status,paystack_reference,tracking_number,carrier,shipped_at,delivered_at,cancelled_at,created_at,updated_at').order('created_at', { ascending: false }).limit(200)
    if (error) throw error
    const ids=(orders??[]).map(o=>o.id)
    const { data: payments, error: paymentError } = ids.length ? await admin.from('payments').select('order_id,reference,amount,currency,status,transaction_id,refunded_amount,refund_reference,refund_status,paid_at,created_at,metadata').in('order_id',ids) : { data: [], error: null }
    if (paymentError) throw paymentError
    return NextResponse.json({ orders: (orders??[]).map(order=>({ ...order, payment:(payments??[]).find(p=>p.order_id===order.id)??null })) })
  } catch (error) {
    console.error('Admin orders API failed',error)
    return NextResponse.json({ error:'Unable to load orders.' },{ status:500 })
  }
}
