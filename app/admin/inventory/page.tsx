import Link from 'next/link'
import { requireRole } from '@/lib/auth/authorization'
import { createClient } from '@/lib/supabase/server'
import InventoryAdjuster from './inventory-adjuster'
import './inventory.css'

type VariantRow={id:string;sku:string;name:string|null;color_name:string|null;stock_quantity:number;is_available:boolean;product_id:string;products:{id:string;name:string;slug:string}|{id:string;name:string;slug:string}[]|null}

type Movement={variant_id:string;quantity_delta:number;reason:string;notes:string|null;created_at:string}

export default async function InventoryPage({searchParams}:{searchParams?:Promise<{q?:string;status?:string}>}){
  await requireRole(['catalog_admin'])
  const params=searchParams?await searchParams:{}
  const q=(params.q??'').trim().toLowerCase().slice(0,100)
  const status=params.status??'all'
  const supabase=await createClient()
  const [{data:variants,error},{data:movements}]=await Promise.all([
    supabase.from('product_variants').select('id,sku,name,color_name,stock_quantity,is_available,product_id,products!inner(id,name,slug)').order('stock_quantity').limit(500),
    supabase.from('inventory_movements').select('variant_id,quantity_delta,reason,notes,created_at').order('created_at',{ascending:false}).limit(200)
  ])
  const rows=(variants??[]) as VariantRow[]
  const filtered=rows.filter(v=>{
    const product=Array.isArray(v.products)?v.products[0]:v.products
    const matches=!q||`${product?.name??''} ${v.sku} ${v.name??''} ${v.color_name??''}`.toLowerCase().includes(q)
    const matchesStatus=status==='out'?v.stock_quantity===0:status==='low'?v.stock_quantity>0&&v.stock_quantity<=3:status==='available'?v.is_available:true
    return matches&&matchesStatus
  })
  const low=rows.filter(v=>v.stock_quantity>0&&v.stock_quantity<=3).length
  const out=rows.filter(v=>v.stock_quantity===0).length
  const available=rows.filter(v=>v.is_available&&v.stock_quantity>0).length
  const latest=new Map<string,Movement>()
  for(const movement of (movements??[]) as Movement[]) if(!latest.has(movement.variant_id)) latest.set(movement.variant_id,movement)

  return <main><section className="zorah-inventory-page">
    <div className="zorah-admin-page-intro"><div><p className="zorah-dashboard-kicker">Sell / inventory</p><h1>Inventory</h1><p>Control sellable stock at variant level. Every manual change is recorded as a movement, and the stock cannot be reduced below zero.</p></div><Link href="/admin/products" className="zorah-admin-secondary-action">View products →</Link></div>
    <div className="zorah-inventory-stats"><div><span>Total variants</span><strong>{rows.length}</strong><em>Tracked catalogue variants</em></div><div><span>Available</span><strong>{available}</strong><em>Currently sellable</em></div><div><span>Low stock</span><strong>{low}</strong><em>1–3 units remaining</em></div><div><span>Out of stock</span><strong>{out}</strong><em>Needs replenishment</em></div></div>
    <section className="zorah-inventory-guide"><div><span className="zorah-dashboard-kicker">What inventory is for</span><h2>Keep the storefront honest.</h2><p>Inventory is the operational record of how many units of each variant Zorah can sell. Restocks increase stock, sales reduce it, returns restore it, and damage or corrections can remove units. The public product page uses these quantities to control availability.</p></div><div className="zorah-inventory-guide-list"><div><b>Available</b><span>Units customers can buy now.</span></div><div><b>Low stock</b><span>Small buffer that deserves attention.</span></div><div><b>Movement history</b><span>Who changed stock, why and when.</span></div></div></section>
    <section className="zorah-inventory-card"><div className="zorah-inventory-card-head"><div><span>Stock control</span><h2>Variants</h2></div><span>{filtered.length} of {rows.length} shown</span></div><form className="zorah-inventory-filters" method="get"><input name="q" value={params.q??''} placeholder="Search product, SKU or variant" aria-label="Search inventory"/><select name="status" defaultValue={status} aria-label="Filter inventory"><option value="all">All stock</option><option value="available">Available</option><option value="low">Low stock</option><option value="out">Out of stock</option></select><button type="submit">Apply filters</button></form>{error?<div className="zorah-inventory-error">Inventory could not be loaded. Refresh and try again.</div>:<div className="zorah-inventory-list">{filtered.map(v=>{const product=Array.isArray(v.products)?v.products[0]:v.products;const movement=latest.get(v.id);return <article className="zorah-inventory-row" key={v.id}><div className="zorah-inventory-product"><div className="zorah-inventory-thumb">{(product?.name??'Z').charAt(0)}</div><div><strong>{product?.name??'Unknown product'}</strong><span>{v.sku}{v.name?` · ${v.name}`:''}{v.color_name?` · ${v.color_name}`:''}</span><small>{movement?`Last movement: ${movement.quantity_delta>0?'+':''}${movement.quantity_delta} · ${movement.reason} · ${new Date(movement.created_at).toLocaleDateString('en-NG')}`:'No movement recorded yet'}</small></div></div><div className="zorah-inventory-quantity"><strong>{v.stock_quantity}</strong><span>units</span></div><span className={`zorah-inventory-status ${v.stock_quantity===0?'is-out':v.stock_quantity<=3?'is-low':v.is_available?'is-ok':'is-off'}`}>{v.stock_quantity===0?'Out of stock':v.stock_quantity<=3?'Low stock':v.is_available?'Available':'Unavailable'}</span><InventoryAdjuster variantId={v.id}/></article>})}{!filtered.length&&<div className="zorah-inventory-empty"><h3>No inventory matches this view.</h3><p>Try another search or filter.</p></div>}</div>}</section>
    <section className="zorah-inventory-note"><span>Operational rule</span><strong>Inventory adjustments are not a substitute for order fulfilment.</strong><p>Paid orders should change stock through the payment/order finalization flow. Use this screen for controlled restocks, returns, damage, physical counts and corrections.</p></section>
  </section></main>
}
