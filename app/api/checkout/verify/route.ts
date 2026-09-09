import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyPaystackTransaction } from '@/lib/payments/paystack'

export const dynamic = 'force-dynamic'

const terminalStatuses = new Set(['success','failed','abandoned','reversed'])

export async function GET(request:Request){
  try{
    const auth=await createClient();const{data:{user}}=await auth.auth.getUser()
    if(!user)return NextResponse.json({error:'Please sign in before verifying payment.'},{status:401})
    const reference=new URL(request.url).searchParams.get('reference')?.trim()
    if(!reference||reference.length>100)return NextResponse.json({error:'Invalid payment reference.'},{status:400})
    const verification=await verifyPaystackTransaction(reference)
    if(!verification.configured)return NextResponse.json({paid:false,status:'unconfigured',setupRequired:true})
    const admin=createAdminClient();const{data:order,error:orderError}=await admin.from('orders').select('id,order_number,user_id,total,currency,payment_status,status').eq('order_number',reference).eq('user_id',user.id).maybeSingle()
    if(orderError||!order)return NextResponse.json({error:'Payment could not be verified.'},{status:404})
    const payment=verification.data;const status=typeof payment?.status==='string'?payment.status:'unknown';const expectedAmount=Math.round(Number(order.total)*100)
    const paid=!!(verification.ok&&status==='success'&&payment?.reference===reference&&Number(payment.amount)===expectedAmount&&payment.currency===order.currency)
    if(paid){
      const{error:finalizeError}=await admin.rpc('finalize_paid_order',{p_order_id:order.id,p_reference:reference,p_amount:order.total,p_currency:order.currency,p_channel:typeof payment?.channel==='string'?payment.channel:null})
      if(finalizeError){console.error('Paid order fulfillment failed',finalizeError);return NextResponse.json({error:'Payment was confirmed, but the order could not be finalized safely.'},{status:409})}
      await admin.from('payments').update({transaction_id:payment?.id??null,status:'paid',paid_at:payment?.paid_at||new Date().toISOString(),metadata:{source:'verify',channel:payment?.channel??null,gateway_response:payment?.gateway_response??null}}).eq('reference',reference)
    }else if(terminalStatuses.has(status)&&order.payment_status!=='paid'&&order.payment_status!=='refunded'){
      const nextPaymentStatus=status==='success'?'pending':'failed'
      await admin.from('orders').update({payment_status:nextPaymentStatus}).eq('id',order.id).neq('payment_status','paid')
      await admin.from('payments').update({status:status==='abandoned'?'abandoned':'failed',metadata:{source:'verify',gateway_response:payment?.gateway_response??null}}).eq('reference',reference).neq('status','paid')
    }else if(status!=='unknown'&&order.payment_status==='unpaid'){
      await admin.from('orders').update({payment_status:'pending'}).eq('id',order.id)
      await admin.from('payments').update({status:'pending',metadata:{source:'verify',gateway_response:payment?.gateway_response??null}}).eq('reference',reference).neq('status','paid')
    }
    return NextResponse.json({paid,status,orderId:order.id,orderNumber:order.order_number,paymentStatus:paid?'paid':status})
  }catch(error){console.error('Payment verification failed',error);return NextResponse.json({error:'Unable to verify payment.'},{status:500})}
}
