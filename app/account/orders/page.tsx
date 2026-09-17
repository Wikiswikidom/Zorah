import Link from 'next/link'
import { AccountSubpage } from '@/components/account-subpage'
import { createClient } from '@/lib/supabase/server'

const money=(n:number,currency='NGN')=>currency==='NGN'?`₦${Number(n).toLocaleString('en-NG',{maximumFractionDigits:2})}`:`${currency} ${Number(n).toLocaleString(undefined,{maximumFractionDigits:2})}`
const title=(value:string)=>value.replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase())

export default async function OrdersPage(){
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  const {data:orders,error}=user?await supabase.from('orders').select('id,order_number,total,currency,status,payment_status,created_at').eq('user_id',user.id).order('created_at',{ascending:false}):{data:[],error:null}
  if(error)console.error('customer orders load failed',error)
  return <AccountSubpage title="Orders" description="Track purchases, delivery and returns in one place." icon="▣">
    {!orders?.length?<div className="jumia-empty-card"><div className="jumia-empty-icon">▣</div><h2>No orders yet</h2><p>Your completed purchases will appear here.</p><Link className="jumia-primary-btn" href="/shop">Start Shopping</Link></div>:<div className="jumia-orders-list">{orders.map(order=><Link className="jumia-order-card" href={`/account/orders/${order.id}`} key={order.id}><div className="jumia-order-head"><div><strong>Order #{order.order_number}</strong><span>{new Date(order.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</span></div><span className={`jumia-status status-${String(order.status).toLowerCase().replace(/[^a-z0-9]+/g,'-')}`}>{title(order.status)}</span></div><div className="jumia-order-foot"><span>{title(order.payment_status)} · View details →</span><strong>{money(Number(order.total),order.currency)}</strong></div></Link>)}</div>}
  </AccountSubpage>
}
