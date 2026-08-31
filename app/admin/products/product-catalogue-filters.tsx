'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function ProductCatalogueFilters({ total }: { total: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const current = useSearchParams()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState(current.get('q') ?? '')
  const [status, setStatus] = useState(current.get('status') ?? 'all')
  const [featured, setFeatured] = useState(current.get('featured') ?? 'all')
  const [sort, setSort] = useState(current.get('sort') ?? 'newest')

  function apply(next?: { q?: string; status?: string; featured?: string; sort?: string }) {
    const p = new URLSearchParams()
    const values = { q, status, featured, sort, ...next }
    if (values.q.trim()) p.set('q', values.q.trim().slice(0, 80))
    if (values.status !== 'all') p.set('status', values.status)
    if (values.featured !== 'all') p.set('featured', values.featured)
    if (values.sort !== 'newest') p.set('sort', values.sort)
    router.push(`${pathname}${p.toString() ? `?${p.toString()}` : ''}`)
    setOpen(false)
  }

  function clear() {
    setQ(''); setStatus('all'); setFeatured('all'); setSort('newest'); router.push(pathname); setOpen(false)
  }

  return <section className="mt-8 rounded-2xl border border-black/10 bg-white/70 p-4 sm:p-5">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
      <label className="flex-1 text-[10px] font-medium uppercase tracking-[.15em]">Search products
        <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') apply() }} maxLength={80} placeholder="Search name or slug…" className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[#B08A3C]" />
      </label>
      <button type="button" onClick={() => apply()} className="rounded-full bg-[#173D32] px-5 py-3 text-xs uppercase tracking-[.13em] text-[#F7F3EC]">Search</button>
      <button type="button" onClick={() => setOpen(v => !v)} className="rounded-full border border-black/15 px-5 py-3 text-xs uppercase tracking-[.13em] lg:hidden">{open ? 'Hide filters' : 'Filters'}</button>
    </div>
    <div className={`${open ? 'grid' : 'hidden'} mt-4 gap-4 sm:grid sm:grid-cols-2 lg:grid lg:grid-cols-4`}>
      <label className="text-[10px] font-medium uppercase tracking-[.15em]">Status<select value={status} onChange={e => { setStatus(e.target.value); apply({ status: e.target.value }) }} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm"><option value="all">All statuses</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
      <label className="text-[10px] font-medium uppercase tracking-[.15em]">Featured<select value={featured} onChange={e => { setFeatured(e.target.value); apply({ featured: e.target.value }) }} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm"><option value="all">All products</option><option value="yes">Featured</option><option value="no">Not featured</option></select></label>
      <label className="text-[10px] font-medium uppercase tracking-[.15em]">Sort<select value={sort} onChange={e => { setSort(e.target.value); apply({ sort: e.target.value }) }} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm"><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="name_asc">Name A–Z</option><option value="name_desc">Name Z–A</option><option value="price_asc">Price low → high</option><option value="price_desc">Price high → low</option></select></label>
      <div className="flex items-end"><button type="button" onClick={clear} className="w-full rounded-xl border border-black/15 px-4 py-3 text-xs uppercase tracking-[.12em]">Clear all</button></div>
    </div>
    <p className="mt-4 text-xs text-black/50">{total} {total === 1 ? 'product' : 'products'} shown</p>
  </section>
}
