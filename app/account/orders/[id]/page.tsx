import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AccountSubpage } from '@/components/account-subpage'
import './order-detail.css'

const money=(n:number,currency='NGN')=>currency==='NGN'?`₦${Number(n).toLocaleString('en-NG',{maximumFractionDigits:2})}`:`${currency} ${Number(n).toLocaleString(undefined,{maximumFractionDigits:2})}`
const title=(value:string)=>value.replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase())
const steps=['pending','processing','shipped','delivered']

export default async function CustomerOrderDetail({params}:{params:Promise<{id:string}>}){
  const {id}=await params
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  if(!user) redirect(`/login?next=${encodeURIComponent(`/account/orders/${id}`)}`)
  const {data:order}=await supabase.from('orders').select('id,order_number,total,currency,status,payment_status,created_at,customer_name,phone,address_line1,address_line2,city,state,country,subtotal,delivery_fee,customer_note,tracking_number,carrier,shipped_at,delivered_at,cancelled_at').eq('id',id).eq('user_id',user.id).maybeSingle()
  if(!order) notFound()
  const [{data:items},{data:history}]=await Promise.all([
    supabase.from('order_items').select('id,product_id,product_name,variant_name,quantity,unit_price,line_total').eq('order_id',id).order('created_at'),
    supabase.from('order_status_history').select('id,status,note,created_at').eq('order_id',id).order('created_at',{ascending:false})
  ])
  const currentIndex=steps.indexOf(order.status)
  return <AccountSubpage title={`Order #${order.order_number}`} description="View your items, payment and delivery progress." icon="▣">
    <div className="order-detail-toolbar"><Link href="/account/orders">← Back to orders</Link><span>{new Date(order.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'long',year:'numeric'})}</span></div>
    <div className="order-detail-grid">
      <section className="order-detail-main">
        <div className="order-detail-card order-progress-card">
          <div className="order-card-heading"><div><span className="order-overline">Delivery status</span><h2>{title(order.status)}</h2></div><span className={`order-pill status-${order.status}`}>{title(order.status)}</span></div>
          {order.status==='cancelled'||order.status==='refunded'?<div className="order-special-state"><strong>{title(order.status)}</strong><span>This order is no longer moving through the delivery workflow.</span></div>:<div className="order-progress"><div className="order-progress-line" />{steps.map((step,index)=>{const active=currentIndex>=index;return <div className={`order-step ${active?'is-active':''}`} key={step}><span>{index+1}</span><strong>{title(step)}</strong></div>})}</div>}
          {(order.carrier||order.tracking_number)&&<div className="tracking-box"><span>Tracking</span><strong>{order.carrier||'Delivery partner'}{order.tracking_number?` · ${order.tracking_number}`:''}</strong></div>}
        </div>
        <div className="order-detail-card">
          <div className="order-card-heading"><div><span className="order-overline">Items</span><h2>{items?.length||0} item{items?.length===1?'':'s'}</h2></div></div>
          <div className="order-items">{(items??[]).map(item=><div className="order-item" key={item.id}><div className="order-item-mark">Z</div><div className="order-item-info"><strong>{item.product_name}</strong><span>{item.variant_name||'Default'} · Qty {item.quantity}</span></div><strong>{money(Number(item.line_total),order.currency)}</strong></div>)}</div>
        </div>
        <div className="order-detail-card">
          <div className="order-card-heading"><div><span className="order-overline">Order timeline</span><h2>Updates</h2></div></div>
          <div className="order-timeline">{(history??[]).map(event=><div className="order-event" key={event.id}><span className="order-event-dot"/><div><strong>{title(event.status)}</strong><span>{event.note||'Order status updated.'}</span><small>{new Date(event.created_at).toLocaleString('en-NG',{day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit'})}</small></div></div>)}</div>
        </div>
      </section>
      <aside className="order-detail-side">
        <div className="order-detail-card"><span className="order-overline">Payment</span><h2>{title(order.payment_status)}</h2><div className="order-total-row"><span>Total</span><strong>{money(Number(order.total),order.currency)}</strong></div><div className="order-total-row"><span>Items</span><span>{money(Number(order.subtotal),order.currency)}</span></div>{Number(order.delivery_fee)>0&&<div className="order-total-row"><span>Delivery</span><span>{money(Number(order.delivery_fee),order.currency)}</span></div>}</div>
        <div className="order-detail-card"><span className="order-overline">Deliver to</span><h2>{order.customer_name}</h2><p>{order.address_line1}{order.address_line2&&<><br/>{order.address_line2}</>}<br/>{order.city}, {order.state}<br/>{order.country}</p><p>{order.phone}</p></div>
        {order.customer_note&&<div className="order-detail-card"><span className="order-overline">Your note</span><p>{order.customer_note}</p></div>}
        <Link className="order-help-link" href="/contact">Need help with this order? Contact Zorah →</Link>
      </aside>
    </div>
  </AccountSubpage>
}
