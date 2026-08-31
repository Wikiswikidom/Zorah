import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/authorization'
import { createClient } from '@/lib/supabase/server'
import ProductForm from '../product-form'

export default async function EditProductPage({params}:{params:Promise<{id:string}>}){
  await requireRole(['catalog_admin']); const {id}=await params; const supabase=await createClient()
  const {data,error}=await supabase.from('products').select('id,name,slug,short_description,description,base_price,status,is_featured,badge,seo_title,seo_description,seo_keywords').eq('id',id).single()
  if(error||!data)notFound()
  return <main className="min-h-screen bg-[#F7F3EC] text-[#111111]"><header className="border-b border-black/10 bg-[#111111] text-[#F7F3EC]"><div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8"><div><Link href="/admin/products" className="font-serif text-2xl tracking-[.12em]">ZORAH</Link><p className="mt-1 text-[10px] uppercase tracking-[.25em] text-[#B08A3C]">Edit product</p></div><Link href="/admin/products" className="text-xs uppercase tracking-[.15em] text-white/70">Catalogue</Link></div></header><section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14"><p className="text-xs uppercase tracking-[.2em] text-[#5A3524]">2D-3B</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">Edit product</h1><p className="mt-3 text-sm text-black/60">Update the catalogue record. Changes are validated on the server and remain subject to Supabase authorization and RLS.</p><div className="mt-8"><ProductForm initial={{...data,base_price:String(data.base_price),seo_keywords:Array.isArray(data.seo_keywords)?data.seo_keywords.join(', '):''}} /></div></section></main>
}
