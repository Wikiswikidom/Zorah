import Link from 'next/link'
import { requireRole } from '@/lib/auth/authorization'
import { createAdminClient } from '@/lib/supabase/admin'

type Customer={user_id:string;email:string|null;full_name:string|null;joined_at:string;is_active:boolean;successful_orders:number;received_orders:number;products_received:number;total_spent:number;last_order_at:string|null}

export default async function AdminCustomersPage({searchParams}:{searchParams?:Promise<{q?:string;sort?:string;status?:string}>}) {
  await requireRole(['support_admin'])
  const params=searchParams?await searchParams:{}
  const q=(params.q??'').trim().toLowerCase().slice(0,100)
  const sort=params.sort??'newest'
  const status=params.status??'all'
  const supabase=createAdminClient()
  const { data: rawCustomers, error } = await supabase.rpc('get_customer_purchase_stats')
  const registered=(rawCustomers??[]) as Customer[]
  const customers=registered.filter(customer=>{
    const matchesQuery=!q||`${customer.full_name??''} ${customer.email??''}`.toLowerCase().includes(q)
    const matchesStatus=status==='active'?customer.is_active:status==='inactive'?!customer.is_active:true
    return matchesQuery&&matchesStatus
  }).sort((a,b)=>{
    if(sort==='oldest') return new Date(a.joined_at).getTime()-new Date(b.joined_at).getTime()
    if(sort==='most-products') return Number(b.products_received)-Number(a.products_received)
    if(sort==='most-orders') return Number(b.successful_orders)-Number(a.successful_orders)
    if(sort==='highest-spend') return Number(b.total_spent)-Number(a.total_spent)
    return new Date(b.joined_at).getTime()-new Date(a.joined_at).getTime()
  })

  return <main><header><div><div><Link href="/admin" className="font-serif text-2xl tracking-[.12em]">ZORAH</Link><p className="mt-1 text-[10px] uppercase tracking-[.25em]">Customer accounts</p></div><Link href="/admin" className="text-xs uppercase tracking-[.18em]">Admin overview</Link></div></header><section><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="zorah-dashboard-kicker">Commerce / accounts</p><h1 className="mt-3 text-5xl">Customers</h1><p className="zorah-dashboard-sub mt-4">Customer Care and the Super Admin can search customers, see when they joined, and identify repeat customers by successful orders, delivered products and total spend. Authentication credentials are never exposed here.</p></div></div>

    <div className="mt-8 grid gap-3 sm:grid-cols-3"><div className="zorah-dashboard-panel"><span className="zorah-dashboard-kicker">Registered</span><strong className="mt-2 block font-serif text-3xl">{registered.length}</strong><p className="mt-1 text-xs text-black/50">Customer accounts</p></div><div className="zorah-dashboard-panel"><span className="zorah-dashboard-kicker">Most loyal</span><strong className="mt-2 block font-serif text-3xl">{Math.max(0,...registered.map(customer=>Number(customer.products_received||0)))}</strong><p className="mt-1 text-xs text-black/50">Products received by one customer</p></div><div className="zorah-dashboard-panel"><span className="zorah-dashboard-kicker">Lifetime value</span><strong className="mt-2 block font-serif text-3xl">₦{Math.round(registered.reduce((sum,customer)=>sum+Number(customer.total_spent||0),0)).toLocaleString('en-NG')}</strong><p className="mt-1 text-xs text-black/50">Paid, non-refunded orders</p></div></div>

    <div className="mt-5 overflow-hidden rounded-2xl border bg-white"><div className="border-b border-black/10 p-4"><form method="get" className="grid gap-3 md:grid-cols-[1fr_220px_220px_auto]"><input name="q" value={params.q??''} type="search" placeholder="Search name or email" aria-label="Search customers by name or email" className="min-w-0"/><select name="sort" defaultValue={sort} aria-label="Sort customers"><option value="newest">Newest customers</option><option value="oldest">Longest customers</option><option value="most-products">Most products received</option><option value="most-orders">Most successful orders</option><option value="highest-spend">Highest total spend</option></select><select name="status" defaultValue={status} aria-label="Filter customers"><option value="all">All customers</option><option value="active">Active only</option><option value="inactive">Inactive only</option></select><button type="submit" className="bg-[#173D32] px-5 py-3 text-[10px] uppercase tracking-[.13em] text-white">Apply</button></form><p className="mt-3 text-[10px] text-black/40">Showing {customers.length} of {registered.length} customers</p></div><div className="overflow-x-auto"><div className="grid min-w-[850px] grid-cols-[2fr_1.1fr_1fr_1fr_1fr_1.2fr] gap-3 border-b border-black/10 px-5 py-3 text-[9px] font-bold uppercase tracking-[.14em] text-black/45"><span>Customer</span><span>Joined</span><span>Orders</span><span>Received</span><span>Products</span><span>Total spend</span></div>{error?<p className="p-6 text-sm text-red-800">Customer accounts could not be loaded.</p>:customers.map(customer=><div key={customer.user_id} className="grid min-w-[850px] grid-cols-[2fr_1.1fr_1fr_1fr_1fr_1.2fr] items-center gap-3 border-b border-black/10 px-5 py-4 last:border-0"><div className="min-w-0"><p className="font-serif text-lg">{customer.full_name||'Zorah customer'}</p><p className="mt-1 truncate text-[10px] text-black/40">{customer.email||'No email available'}</p></div><span className="text-xs">{new Date(customer.joined_at).toLocaleDateString('en-NG',{dateStyle:'medium'})}</span><span className="text-xs">{customer.successful_orders}</span><span className="text-xs">{customer.received_orders}</span><span className="font-semibold text-xs">{customer.products_received}</span><span className="text-xs">₦{Math.round(Number(customer.total_spent||0)).toLocaleString('en-NG')}</span></div>)}{!error&&!customers.length&&<p className="p-8 text-center text-sm text-black/55">No customers match this search.</p>}</div></div>

    <div className="zorah-dashboard-panel mt-5"><span className="zorah-dashboard-kicker">Customer data boundary</span><h2 className="mt-2 text-2xl">Support sees business context, not credentials.</h2><p className="mt-3 text-sm text-black/60">This workspace exposes customer profile and purchase statistics only. Passwords, authentication tokens and private Auth records remain inside Supabase Auth. The reporting endpoint is server-only and cannot be called by normal customers.</p></div>
  </section></main>
}
