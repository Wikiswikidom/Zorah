'use client'

import { useState } from 'react'

type Variant={id:string;sku:string;name:string|null;color_name:string|null;color_hex:string|null;price:number|null;stock_quantity:number;is_available:boolean;is_default:boolean}
const input='w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#B08A3C] focus:ring-2 focus:ring-[#B08A3C]/15'
const empty={sku:'',name:'',color_name:'',color_hex:'',price:'',stock_quantity:'0',is_available:true,is_default:false}

export default function VariantManager({productId,initial}:{productId:string;initial:Variant[]}){
 const [items,setItems]=useState(initial),[form,setForm]=useState(empty),[editing,setEditing]=useState<string|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const reset=()=>{setForm(empty);setEditing(null);setError('')}
 const save=async()=>{if(busy)return;setError('');setBusy(true);try{const res=await fetch(editing?`/api/admin/products/${productId}/variants/${editing}`:`/api/admin/products/${productId}/variants`,{method:editing?'PATCH':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,price:Number(form.price),stock_quantity:Number(form.stock_quantity)})});const d=await res.json().catch(()=>({}));if(!res.ok)throw new Error(d.error||'Could not save variant.');if(editing)setItems(x=>x.map(v=>v.id===editing?d.variant:v));else setItems(x=>[...x,d.variant]);reset()}catch(e){setError(e instanceof Error?e.message:'Could not save variant.')}finally{setBusy(false)}}
 const edit=(v:Variant)=>{setEditing(v.id);setForm({sku:v.sku,name:v.name||'',color_name:v.color_name||'',color_hex:v.color_hex||'',price:String(v.price??''),stock_quantity:String(v.stock_quantity),is_available:v.is_available,is_default:v.is_default})}
 const remove=async(id:string)=>{if(!confirm('Remove this variant?'))return;setBusy(true);try{const res=await fetch(`/api/admin/products/${productId}/variants/${id}`,{method:'DELETE'});if(!res.ok)throw new Error('Could not remove variant.');setItems(x=>x.filter(v=>v.id!==id));if(editing===id)reset()}catch(e){setError(e instanceof Error?e.message:'Could not remove variant.')}finally{setBusy(false)}}
 return <section className="mt-8 rounded-2xl border border-black/10 bg-white/75 p-5 sm:p-7"><div className="flex items-end justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.2em] text-[#5A3524]">2D-3C</p><h2 className="mt-1 font-serif text-2xl">Variants</h2></div><span className="text-xs text-black/50">{items.length} variant{items.length===1?'':'s'}</span></div>
 {error&&<div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
 <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <label className="text-[10px] uppercase tracking-wider">SKU<input className={input} maxLength={64} value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})}/></label>
  <label className="text-[10px] uppercase tracking-wider">Variant name<input className={input} maxLength={100} value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
  <label className="text-[10px] uppercase tracking-wider">Colour<input className={input} maxLength={60} value={form.color_name} onChange={e=>setForm({...form,color_name:e.target.value})}/></label>
  <label className="text-[10px] uppercase tracking-wider">Colour hex<input className={input} placeholder="#173D32" value={form.color_hex} onChange={e=>setForm({...form,color_hex:e.target.value})}/></label>
  <label className="text-[10px] uppercase tracking-wider">Price (NGN)<input className={input} type="number" min="0" step="0.01" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label>
  <label className="text-[10px] uppercase tracking-wider">Stock<input className={input} type="number" min="0" step="1" value={form.stock_quantity} onChange={e=>setForm({...form,stock_quantity:e.target.value})}/></label>
  <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.is_available} onChange={e=>setForm({...form,is_available:e.target.checked})}/> Available</label>
  <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.is_default} onChange={e=>setForm({...form,is_default:e.target.checked})}/> Default variant</label>
 </div>
 <div className="mt-4 flex gap-3"><button disabled={busy} onClick={save} className="rounded-full bg-[#173D32] px-5 py-2.5 text-xs uppercase tracking-wider text-[#F7F3EC] disabled:opacity-50">{busy?'Saving…':editing?'Update variant':'Add variant'}</button>{editing&&<button onClick={reset} className="rounded-full border border-black/15 px-5 py-2.5 text-xs uppercase tracking-wider">Cancel</button>}</div>
 <div className="mt-7 space-y-3">{items.map(v=><div key={v.id} className="flex flex-col gap-3 rounded-xl border border-black/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="h-8 w-8 rounded-full border border-black/10" style={{backgroundColor:v.color_hex||'#eee'}}/><div><p className="text-sm font-medium">{v.name||v.color_name||v.sku}</p><p className="text-xs text-black/50">{v.sku} · ₦{Number(v.price||0).toLocaleString('en-NG')} · {v.stock_quantity} in stock{v.is_default?' · Default':''}</p></div></div><div className="flex gap-2"><button onClick={()=>edit(v)} className="rounded-full border border-black/15 px-4 py-2 text-[10px] uppercase tracking-wider">Edit</button><button onClick={()=>remove(v.id)} disabled={busy} className="rounded-full border border-red-200 px-4 py-2 text-[10px] uppercase tracking-wider text-red-700">Remove</button></div></div>)}</div>
 </section>
}
