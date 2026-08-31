'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type ProductFormValues = {
  id?: string; name: string; slug: string; short_description: string; description: string
  base_price: string; status: 'draft' | 'published' | 'archived'; is_featured: boolean
  badge: string; seo_title: string; seo_description: string; seo_keywords: string
}

const empty: ProductFormValues = { name:'', slug:'', short_description:'', description:'', base_price:'', status:'draft', is_featured:false, badge:'', seo_title:'', seo_description:'', seo_keywords:'' }
const slugify = (v:string) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,120)
const field='mt-2 w-full rounded-xl border border-[#111111]/12 bg-white px-4 py-3 text-sm outline-none focus:border-[#B08A3C] focus:ring-2 focus:ring-[#B08A3C]/15'

export default function ProductForm({ initial }: { initial?: ProductFormValues }) {
  const router=useRouter(); const [form,setForm]=useState(initial??empty); const [manualSlug,setManualSlug]=useState(!!initial?.slug); const [saving,setSaving]=useState(false); const [error,setError]=useState('')
  useEffect(()=>{ if(!manualSlug) setForm(v=>({...v,slug:slugify(v.name)})) },[form.name,manualSlug])
  const set=(key:keyof ProductFormValues,value:unknown)=>setForm(v=>({...v,[key]:value}))
  async function submit(e:React.FormEvent){ e.preventDefault(); if(saving)return; setError(''); const name=form.name.trim(),slug=slugify(form.slug),price=Number(form.base_price)
    if(name.length<2||name.length>160)return setError('Product name must be 2–160 characters.')
    if(!slug)return setError('Enter a valid product slug.')
    if(!Number.isFinite(price)||price<0||price>1000000000)return setError('Enter a valid NGN price.')
    setSaving(true)
    try{ const res=await fetch(form.id?`/api/admin/products/${form.id}`:'/api/admin/products',{method:form.id?'PATCH':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,name,slug,base_price:price,seo_keywords:form.seo_keywords.split(',').map(x=>x.trim()).filter(Boolean)})}); const data=await res.json().catch(()=>({})); if(!res.ok)throw new Error(data.error||'Could not save product.'); router.push('/admin/products'); router.refresh() }catch(err){setError(err instanceof Error?err.message:'Could not save product.');setSaving(false)}
  }
  return <form onSubmit={submit} className="space-y-7">
    {error&&<div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
    <section className="rounded-2xl border border-[#111111]/10 bg-white/75 p-5 sm:p-7"><h2 className="font-serif text-2xl">Product information</h2><div className="mt-6 grid gap-5 sm:grid-cols-2">
      <label className="sm:col-span-2 text-xs font-medium uppercase tracking-[.12em]">Name<input className={field} value={form.name} onChange={e=>set('name',e.target.value)} maxLength={160} required/></label>
      <label className="text-xs font-medium uppercase tracking-[.12em]">Slug<input className={field} value={form.slug} onChange={e=>{setManualSlug(true);set('slug',e.target.value)}} maxLength={120} required/></label>
      <label className="text-xs font-medium uppercase tracking-[.12em]">Price (NGN)<input className={field} type="number" min="0" max="1000000000" step="0.01" inputMode="decimal" value={form.base_price} onChange={e=>set('base_price',e.target.value)} required/></label>
      <label className="sm:col-span-2 text-xs font-medium uppercase tracking-[.12em]">Short description<textarea className={field} rows={3} maxLength={500} value={form.short_description} onChange={e=>set('short_description',e.target.value)}/></label>
      <label className="sm:col-span-2 text-xs font-medium uppercase tracking-[.12em]">Description<textarea className={field} rows={7} maxLength={10000} value={form.description} onChange={e=>set('description',e.target.value)}/></label>
    </div></section>
    <section className="rounded-2xl border border-[#111111]/10 bg-white/75 p-5 sm:p-7"><h2 className="font-serif text-2xl">Publishing & merchandising</h2><div className="mt-6 grid gap-5 sm:grid-cols-2">
      <label className="text-xs font-medium uppercase tracking-[.12em]">Status<select className={field} value={form.status} onChange={e=>set('status',e.target.value)}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
      <label className="text-xs font-medium uppercase tracking-[.12em]">Badge<input className={field} maxLength={40} placeholder="New, Bestseller, Limited" value={form.badge} onChange={e=>set('badge',e.target.value)}/></label>
      <label className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-[#111111]/10 p-4 text-sm"><input type="checkbox" checked={form.is_featured} onChange={e=>set('is_featured',e.target.checked)}/> Feature this product in eligible merchandising placements.</label>
    </div></section>
    <section className="rounded-2xl border border-[#111111]/10 bg-white/75 p-5 sm:p-7"><h2 className="font-serif text-2xl">SEO</h2><div className="mt-6 grid gap-5">
      <label className="text-xs font-medium uppercase tracking-[.12em]">SEO title<input className={field} maxLength={70} value={form.seo_title} onChange={e=>set('seo_title',e.target.value)}/></label>
      <label className="text-xs font-medium uppercase tracking-[.12em]">SEO description<textarea className={field} rows={3} maxLength={170} value={form.seo_description} onChange={e=>set('seo_description',e.target.value)}/></label>
      <label className="text-xs font-medium uppercase tracking-[.12em]">SEO keywords<input className={field} placeholder="leather handbag, Lagos handbag, Zorah" value={form.seo_keywords} onChange={e=>set('seo_keywords',e.target.value)}/></label>
    </div></section>
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={()=>router.push('/admin/products')} className="rounded-full border border-[#111111]/15 px-6 py-3 text-xs font-medium uppercase tracking-[.14em]">Cancel</button><button disabled={saving} className="rounded-full bg-[#173D32] px-7 py-3 text-xs font-medium uppercase tracking-[.14em] text-[#F7F3EC] disabled:opacity-60">{saving?'Saving…':form.id?'Save changes':'Create product'}</button></div>
  </form>
}
