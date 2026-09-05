import Link from 'next/link'
import { AccountSubpage } from '@/components/account-subpage'
import { createClient } from '@/lib/supabase/server'

export default async function OrdersPage(){
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  const {data:orders,error}=user?await supabase.from('orders').select('id,order_number,total,currency,status,payment_status,created_at').eq('user_id',user.id).order('created_at',{ascending:false}):{data:[],error:null}
  if(error)console.error('customer orders load failed',error)
  return <AccountSubpage title="Orders" description="Track purchases, delivery and returns in one place." icon="▣">
    {!orders?.length?<div className="jumia-empty-card"><div className="jumia-empty-icon">▣</div><h2>No orders yet</h2><p>Your completed purchases will appear here.</p><Link className="jumia-primary-btn" href="/shop">Start Shopping</Link></div>:<div className="jumia-orders-list">{orders.map(order=><article className="jumia-order-card" key={order.id}><div className="jumia-order-head"><div><strong>Order #{order.order_number}</strong><span>{new Date(order.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</span></div><span className={`jumia-status status-${String(order.status).toLowerCase().replace(/[^a-z0-9]+/g,'-')}`}>{order.status}</span></div><div className="jumia-order-foot"><span>{order.payment_status}</span><strong>{order.currency} {Number(order.total).toLocaleString('en-NG')}</strong></div></article>)}</div>}
  </AccountSubpage>
}
