import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createAdminClient } from '@/lib/supabase/admin'
import { createPaystackRefund } from '@/lib/payments/paystack'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const text=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):''

export async function POST(request:Request){
  try{
    const{user}=await requireRole(['order_admin'])
    const body=await request.json().catch(()=>null) as Record<string,unknown>|null
    const orderId=text(body?.orderId,80),note=text(body?.customerNote,500),merchantNote=text(body?.merchantNote,500)
    const requested=body?.amount===undefined||body?.amount===null||body?.amount===''?undefined:Number(body.amount)
    if(!orderId)return NextResponse.json({error:'Order is required.'},{status:400})
    if(requested!==undefined&&(!Number.isFinite(requested)||requested<=0))return NextResponse.json({error:'Enter a valid refund amount.'},{status:400})
    const admin=createAdminClient()
    const{data:order}=await admin.from('orders').select('id,order_number,total,currency,payment_status').eq('id',orderId).maybeSingle()
    if(!order)return NextResponse.json({error:'Order not found.'},{status:404})
    if(order.payment_status!=='paid')return NextResponse.json({error:'Only paid orders can be refunded.'},{status:409})
    const{data:payment}=await admin.from('payments').select('id,reference,transaction_id,amount,refunded_amount,refund_status').eq('order_id',order.id).eq('status','paid').maybeSingle()
    if(!payment)return NextResponse.json({error:'No paid Paystack transaction is linked to this order.'},{status:409})
    const original=Number(payment.amount),already=Number(payment.refunded_amount||0),amount=requested??(original-already)
    if(!Number.isFinite(original)||amount<=0||already+amount>original)return NextResponse.json({error:`Refund amount cannot exceed the remaining ₦${Math.max(0,original-already).toLocaleString('en-NG')}.`},{status:400})
    if(payment.refund_status==='pending'||payment.refund_status==='processing'||payment.refund_status==='needs-attention')return NextResponse.json({error:'A refund is already in progress for this payment.'},{status:409})
    const refund=await createPaystackRefund({transaction:payment.transaction_id??payment.reference,amountNaira:amount,currency:order.currency,customerNote:note,merchantNote:merchantNote||`Zorah refund for ${order.order_number}`})
    const refundStatus=text(refund?.status,40)||'pending',refundReference=text(refund?.reference||refund?.id,100)||null
    await admin.from('payments').update({refund_status:refundStatus,refund_reference:refundReference,refunded_amount:already+amount,refunded_at:refundStatus==='processed'?new Date().toISOString():null}).eq('id',payment.id)
    await admin.from('admin_audit_logs').insert({actor_id:user.id,actor_role:'order_admin',action:'UPDATE',resource_type:'payment_refund',resource_id:payment.id,result:'success',metadata:{order_id:order.id,order_number:order.order_number,amount,currency:order.currency,refund_status:refundStatus}})
    return NextResponse.json({success:true,status:refundStatus,amount,refundReference})
  }catch(error){console.error('Refund request failed',error);return NextResponse.json({error:error instanceof Error?error.message:'Refund could not be initiated.'},{status:500})}
}
