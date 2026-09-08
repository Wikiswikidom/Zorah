import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request:Request){
  try{
    const auth=await createClient()
    const{data:{user}}=await auth.auth.getUser()
    if(!user)return NextResponse.json({error:'Please sign in before verifying payment.'},{status:401})

    const reference=new URL(request.url).searchParams.get('reference')?.trim()
    if(!reference||reference.length>100)return NextResponse.json({error:'Invalid payment reference.'},{status:400})

    const secret=process.env.PAYSTACK_SECRET_KEY
    if(!secret)return NextResponse.json({paid:false,setupRequired:true})

    const admin=createAdminClient()
    const{data:order,error:orderError}=await admin.from('orders').select('id,order_number,user_id,total,currency,payment_status,status').eq('order_number',reference).eq('user_id',user.id).maybeSingle()
    if(orderError||!order)return NextResponse.json({error:'Payment could not be verified.'},{status:404})

    const response=await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,{headers:{Authorization:`Bearer ${secret}`,'Content-Type':'application/json'},cache:'no-store'})
    const result=await response.json().catch(()=>null)
    const paystackData=result?.data
    const expectedAmount=Math.round(Number(order.total)*100)
    const paid=!!(
      response.ok&&result?.status&&paystackData?.status==='success'&&
      paystackData?.reference===reference&&
      Number(paystackData?.amount)===expectedAmount&&
      paystackData?.currency===order.currency
    )

    if(paid){
      const{error:updateError}=await admin.from('orders').update({payment_status:'paid',status:order.status==='pending'?'processing':order.status}).eq('id',order.id).neq('payment_status','refunded')
      if(updateError)return NextResponse.json({error:'Could not update order status.'},{status:500})
      const{error:paymentError}=await admin.from('payments').update({status:'paid',paid_at:new Date().toISOString(),metadata:{channel:paystackData?.channel??null}}).eq('reference',reference).eq('order_id',order.id)
      if(paymentError)return NextResponse.json({error:'Payment was verified but its ledger could not be updated.'},{status:500})
    }else if(order.payment_status!=='paid'&&order.payment_status!=='refunded'){
      await admin.from('orders').update({payment_status:'failed'}).eq('id',order.id).eq('payment_status','unpaid')
      await admin.from('payments').update({status:'failed'}).eq('reference',reference).eq('order_id',order.id).neq('status','paid')
    }

    return NextResponse.json({paid})
  }catch{return NextResponse.json({error:'Unable to verify payment.'},{status:500})}
}
