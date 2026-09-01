import Link from 'next/link'
import { requireRole } from '@/lib/auth/authorization'
import { createClient } from '@/lib/supabase/server'
import MerchandisingManager from './merchandising-manager'

export default async function AdminMerchandisingPage(){
 await requireRole(['catalog_admin','marketing_admin','super_admin'])
 const supabase=await createClient()
 const [{data:slots},{data:products}]=await Promise.all([
  supabase.from('merchandising_slots').select('id').limit(100),
  supabase.from('products').select('id').eq('status','published').limit(100)
 ])
 return <main className="min-h-screen bg-[#F7F3EC] text-[#111111]"><header className="border-b border-black/10 bg-[#111111] text-[#F7F3EC]"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8"><div><Link href="/admin" className="font-serif text-2xl tracking-[.12em]">ZORAH</Link><p className="mt-1 text-[10px] uppercase tracking-[.25em] text-[#B08A3C]">Merchandising studio</p></div><Link href="/" className="text-xs uppercase tracking-[.18em] text-white/75">View store</Link></div></header><section className="mx-auto max-w-7xl px-5 py-10 sm:px-8"><p className="text-xs uppercase tracking-[.2em] text-[#5A3524]">2D-8</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">Merchandising</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-black/65">Curate product placement without changing code. The catalogue remains the source of truth and only published products can be promoted.</p><div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-[#111111] p-6 text-white"><p className="text-xs uppercase tracking-[.15em] text-[#B08A3C]">Published products</p><p className="mt-2 font-serif text-4xl">{products?.length??0}</p></div><div className="rounded-2xl bg-[#173D32] p-6 text-white"><p className="text-xs uppercase tracking-[.15em] text-white/60">Placements</p><p className="mt-2 font-serif text-4xl">{slots?.length??0}</p></div><div className="rounded-2xl bg-[#5A3524] p-6 text-white"><p className="text-xs uppercase tracking-[.15em] text-white/60">Strategy</p><p className="mt-2 font-serif text-2xl">Curated, not crowded.</p></div></div><div className="mt-8"><MerchandisingManager /></div></section></main>
}
