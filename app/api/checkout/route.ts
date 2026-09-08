import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const text=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):''
type CartRequestItem={slug:string;variant:string;quantity:number}
type OrderLine={product_id:string;variant_id:string|null;product_name:string;variant_name:string;quantity:number;unit_price:number;line_total:number}

export async function POST(request:Request){
  try{
    const auth=await createClient()
    const{data:{user}}=await auth.auth.getUser()
    if(!user)return NextResponse.json({error:'Please sign in before checkout.'},{status:401})

    const body=await request.json().catch(()=>null)
    if(!body||typeof body!=='object'||!Array.isArray(body.items))return NextResponse.json({error:'Your bag could not be read.'},{status:400})

    const input=body as Record<string,unknown>
    const name=text(input.customer_name??input.full_name,120)
    const email=(user.email||'').trim().toLowerCase()
    const phone=text(input.phone,40)
    const address1=text(input.address_line1,240)
    const address2=text(input.address_line2,240)
    const city=text(input.city,100)
    const state=text(input.state,100)
    const country=text(input.country,80)||'Nigeria'
    const termsAccepted=input.termsAccepted===true
    if(!name||!email||!phone||!address1||!city||!state||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return NextResponse.json({error:'Complete your name, email, phone and delivery address.'},{status:400})
    if(!termsAccepted)return NextResponse.json({error:'Please read and accept the Terms & Conditions before continuing to payment.'},{status:400})

    const parsed:CartRequestItem[]=body.items.slice(0,50).map((x:unknown)=>{
      const i=x as Record<string,unknown>
      return{slug:text(i.slug,120),variant:text(i.variant,100)||'Default',quantity:Math.floor(Number(i.quantity))}
    })
    if(!parsed.length||parsed.some(i=>!i.slug||!Number.isInteger(i.quantity)||i.quantity<1||i.quantity>99))return NextResponse.json({error:'Your bag contains an invalid item.'},{status:400})

    const itemMap=new Map<string,CartRequestItem>()
    for(const item of parsed){
      const key=`${item.slug}\u0000${item.variant}`
      const previous=itemMap.get(key)
      const quantity=(previous?.quantity??0)+item.quantity
      if(quantity>99)return NextResponse.json({error:'A product quantity cannot exceed 99.'},{status:400})
      itemMap.set(key,{...item,quantity})
    }
    const items=[...itemMap.values()]

    const admin=createAdminClient()
    const{data:terms}=await admin.from('legal_pages').select('version').eq('slug','terms-and-conditions').eq('is_published',true).maybeSingle()
    const termsVersion=text(terms?.version,40)||'1.0'
    const slugs=[...new Set(items.map(i=>i.slug))]
    const{data:products,error:pe}=await admin.from('products').select('id,slug,name,base_price,currency,status').in('slug',slugs).eq('status','published')
    if(pe||!products||products.length!==slugs.length)return NextResponse.json({error:'One or more products are no longer available.'},{status:409})
    if(products.some(product=>product.currency!=='NGN'))return NextResponse.json({error:'One or more products use an unsupported checkout currency.'},{status:409})

    const productIds=products.map(p=>p.id)
    const{data:variants,error:ve}=await admin.from('product_variants').select('id,product_id,name,color_name,price,stock_quantity,is_available').in('product_id',productIds)
    if(ve)return NextResponse.json({error:'Product availability could not be checked.'},{status:500})

    const lines:OrderLine[]=[]
    for(const item of items){
      const p=products.find(x=>x.slug===item.slug)!
      const productVariants=(variants??[]).filter(x=>x.product_id===p.id)
      const v=productVariants.find(x=>x.color_name===item.variant||x.name===item.variant)
      if(productVariants.length&&!v)return NextResponse.json({error:`${p.name} is not available in ${item.variant}.`},{status:409})
      if(v&&!v.is_available)return NextResponse.json({error:`${p.name} is not available in ${item.variant}.`},{status:409})
      if(v&&v.stock_quantity<item.quantity)return NextResponse.json({error:`Only ${v.stock_quantity} of ${p.name} (${item.variant}) are currently available.`},{status:409})
      const price=Number(v?.price??p.base_price)
      if(!Number.isFinite(price)||price<0)return NextResponse.json({error:`${p.name} has an invalid price.`},{status:409})
      lines.push({product_id:p.id,variant_id:v?.id??null,product_name:p.name,variant_name:v?.name??item.variant,quantity:item.quantity,unit_price:price,line_total:price*item.quantity})
    }

    const subtotal=lines.reduce((sum,x)=>sum+x.line_total,0)
    if(!Number.isSafeInteger(Math.round(subtotal*100))||subtotal<0)return NextResponse.json({error:'The order total is invalid.'},{status:409})
    const orderNumber=`ZOR-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${crypto.randomUUID().slice(0,8).toUpperCase()}`
    const{data:order,error:oe}=await admin.from('orders').insert({order_number:orderNumber,user_id:user.id,customer_name:name,email,phone,address_line1:address1,address_line2:address2||null,city,state,country,subtotal,delivery_fee:0,total:subtotal,currency:'NGN',status:'pending',payment_status:'unpaid',terms_accepted_at:new Date().toISOString(),terms_version:termsVersion}).select('id,order_number,total').single()
    if(oe||!order)return NextResponse.json({error:'Could not create your order.'},{status:500})

    const{error:ie}=await admin.from('order_items').insert(lines.map(x=>({...x,order_id:order.id})))
    if(ie){await admin.from('orders').delete().eq('id',order.id);return NextResponse.json({error:'Could not save your order items.'},{status:500})}

    const secret=process.env.PAYSTACK_SECRET_KEY
    if(!secret)return NextResponse.json({orderId:order.id,orderNumber:order.order_number,paymentUrl:null,paymentSetupRequired:true})

    const origin=new URL(request.url).origin
    const pay=await fetch('https://api.paystack.co/transaction/initialize',{method:'POST',headers:{Authorization:`Bearer ${secret}`,'Content-Type':'application/json'},body:JSON.stringify({email,amount:Math.round(Number(order.total)*100),currency:'NGN',reference:order.order_number,callback_url:`${origin}/checkout/complete`})})
    const result=await pay.json().catch(()=>null)
    if(!pay.ok||!result?.status||!result?.data?.authorization_url)return NextResponse.json({error:'Order saved, but payment could not be initialized. Please try again.'},{status:502})

    await admin.from('orders').update({paystack_reference:order.order_number}).eq('id',order.id)
    await admin.from('payments').insert({order_id:order.id,provider:'paystack',reference:order.order_number,amount:order.total,currency:'NGN',status:'initialized',metadata:{channel:result.data.channel??null}})
    return NextResponse.json({orderId:order.id,orderNumber:order.order_number,paymentUrl:result.data.authorization_url,paymentSetupRequired:false})
  }catch(error){console.error('Checkout route failed',error);return NextResponse.json({error:'Checkout could not be completed right now.'},{status:500})}
}
