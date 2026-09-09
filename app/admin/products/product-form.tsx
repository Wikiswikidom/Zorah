'use client'

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

type ColourDraft = { name: string; hex: string; price: string; stock: string; sku: string; available: boolean; default: boolean }
type ProductFormValues = { id?: string; name: string; slug: string; short_description: string; description: string; base_price: string; status: 'draft' | 'published' | 'archived'; is_featured: boolean; badge: string; seo_title: string; seo_description: string; seo_keywords: string; category_id?: string; material: string; dimensions: string; capacity: string; care_instructions: string; delivery_returns: string; features: string }
type Category = { id: string; name: string }
type PreviewFile = { file: File; url: string; id: string }

const empty: ProductFormValues = { name: '', slug: '', short_description: '', description: '', base_price: '', status: 'published', is_featured: false, badge: '', seo_title: '', seo_description: '', seo_keywords: '', category_id: '', material: '', dimensions: '', capacity: '', care_instructions: '', delivery_returns: '', features: '' }
const blankColour = (): ColourDraft => ({ name: '', hex: '#173D32', price: '', stock: '0', sku: '', available: true, default: false })
const slugify = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120)
const field = 'mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#B08A3C] focus:ring-2 focus:ring-[#B08A3C]/15'
const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_FILES = 8
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

export default function ProductForm({ initial }: { initial?: ProductFormValues }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<ProductFormValues>(initial ?? empty)
  const [categories, setCategories] = useState<Category[]>([])
  const [manualSlug, setManualSlug] = useState(!!initial?.slug)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedCount, setUploadedCount] = useState(0)
  const [error, setError] = useState('')
  const [files, setFiles] = useState<PreviewFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [primaryIndex, setPrimaryIndex] = useState(0)
  const [colours, setColours] = useState<ColourDraft[]>([])

  useEffect(() => { if (!manualSlug) setForm(v => ({ ...v, slug: slugify(v.name) })) }, [form.name, manualSlug])
  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/categories', { cache: 'no-store' })
      .then(async r => { const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || 'Could not load categories.'); return d })
      .then(d => { if (!cancelled) setCategories(d.categories ?? []) })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load categories.') })
    return () => { cancelled = true }
  }, [])
  useEffect(() => () => files.forEach(item => URL.revokeObjectURL(item.url)), [files])

  const set = (key: keyof ProductFormValues, value: unknown) => setForm(v => ({ ...v, [key]: value }))
  const previews = useMemo(() => files, [files])

  const validateFiles = (selected: File[]) => {
    if (!selected.length) return 'Choose at least one product image.'
    if (files.length + selected.length > MAX_FILES) return `You can upload up to ${MAX_FILES} product images.`
    if (selected.some(f => f.size > MAX_FILE_SIZE)) return 'Each product image must be 10 MB or smaller.'
    if (selected.some(f => !IMAGE_TYPES.includes(f.type))) return 'Use JPG, PNG, WebP or AVIF images only.'
    return ''
  }

  const addFiles = (list: FileList | File[]) => {
    const selected = Array.from(list)
    const validation = validateFiles(selected)
    if (validation) { setError(validation); return }
    const additions = selected.map((file, i) => ({ file, url: URL.createObjectURL(file), id: `${file.name}-${file.lastModified}-${Date.now()}-${i}` }))
    setError('')
    setFiles(current => [...current, ...additions])
  }

  const chooseFiles = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
    e.target.value = ''
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragActive(false)
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files)
  }

  const removeFile = (index: number) => {
    const target = files[index]
    if (target) URL.revokeObjectURL(target.url)
    setFiles(current => current.filter((_, i) => i !== index))
    setPrimaryIndex(current => current > index ? current - 1 : current === index ? Math.max(0, current - 1) : current)
    setError('')
  }

  const updateColour = (index: number, key: keyof ColourDraft, value: unknown) => setColours(x => x.map((c, i) => i === index ? { ...c, [key]: value } : c))
  const addColour = () => { if (colours.length < 8) setColours(x => [...x, blankColour()]) }
  const removeColour = (i: number) => setColours(x => x.filter((_, n) => n !== i))

  async function uploadImages(id: string) {
    for (let index = 0; index < files.length; index++) {
      const item = files[index]
      const body = new FormData()
      body.append('file', item.file)
      body.append('alt_text', `${form.name.trim()} — product image ${index + 1}`)
      body.append('is_primary', String(index === primaryIndex))
      const r = await fetch(`/api/admin/products/${id}/media`, { method: 'POST', body })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(d.error || `Could not upload ${item.file.name}.`)
      setUploadedCount(index + 1)
    }
  }

  async function uploadColours(id: string) {
    for (let i = 0; i < colours.length; i++) {
      const c = colours[i], name = c.name.trim()
      if (!name) continue
      const sku = (c.sku.trim() || `${slugify(form.name).slice(0, 35)}-${slugify(name).slice(0, 20)}-${i + 1}`).toUpperCase().replace(/[^A-Z0-9._-]/g, '-').slice(0, 64)
      const price = Number(c.price || form.base_price), stock = Number(c.stock || 0)
      const r = await fetch(`/api/admin/products/${id}/variants`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sku, name, color_name: name, color_hex: c.hex, price, stock_quantity: stock, is_available: c.available, is_default: c.default || i === 0 }) })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(d.error || `Could not save colour ${name}.`)
    }
  }

  async function deleteCreatedProduct(id: string) { try { await fetch(`/api/admin/products/${id}`, { method: 'DELETE' }) } catch {} }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (saving || uploading) return
    setError('')
    const name = form.name.trim(), slug = slugify(form.slug), price = Number(form.base_price)
    if (name.length < 2 || name.length > 160) return setError('Product name must be 2–160 characters.')
    if (!slug) return setError('Enter a valid product slug.')
    if (!form.category_id) return setError('Select a product category.')
    if (!Number.isFinite(price) || price < 0 || price > 1000000000) return setError('Enter a valid NGN price.')
    if (!form.id && !files.length) return setError('Add at least one product image.')
    if (colours.some(c => c.name.trim() && (!Number.isFinite(Number(c.price || price)) || Number(c.price || price) < 0))) return setError('Check the colour prices.')
    setSaving(true); setUploading(false); setUploadedCount(0)
    try {
      const requestedStatus = form.status
      const payload = { ...form, name, slug, base_price: price, seo_keywords: form.seo_keywords.split(',').map(x => x.trim()).filter(Boolean), features: form.features.split('\n').map(x => x.trim()).filter(Boolean), status: form.id ? requestedStatus : 'draft' }
      const res = await fetch(form.id ? `/api/admin/products/${form.id}` : '/api/admin/products', { method: form.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not save product.')
      const id = form.id || data.id
      if (!id) throw new Error('Product was saved but its ID was not returned.')
      if (!form.id) {
        setUploading(true)
        try { await uploadImages(id); await uploadColours(id) }
        catch (uploadError) { await deleteCreatedProduct(id); throw uploadError }
        setUploading(false)
        if (requestedStatus === 'published') {
          const publishRes = await fetch(`/api/admin/products/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, status: 'published' }) })
          const publishData = await publishRes.json().catch(() => ({}))
          if (!publishRes.ok) throw new Error(publishData.error || 'Product was created but could not be published.')
        }
      }
      router.push(`/admin/products/${id}`); router.refresh()
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save product.'); setSaving(false); setUploading(false) }
  }

  return <form onSubmit={submit} className="space-y-6">
    {error && <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><span className="mt-0.5">!</span><span>{error}</span></div>}

    <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
      <h2 className="font-serif text-2xl">Product information</h2><p className="mt-1 text-sm text-black/55">Everything entered here is available to the customer on the product page.</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="sm:col-span-2 text-xs font-semibold">Product name<input className={field} value={form.name} onChange={e => set('name', e.target.value)} maxLength={160} required /></label>
        <label className="text-xs font-semibold">Category<select className={field} value={form.category_id ?? ''} onChange={e => set('category_id', e.target.value)} required><option value="">Select category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="text-xs font-semibold">Slug<input className={field} value={form.slug} onChange={e => { setManualSlug(true); set('slug', e.target.value) }} maxLength={120} required /></label>
        <label className="text-xs font-semibold">Price (NGN)<input className={field} type="number" min="0" step="0.01" value={form.base_price} onChange={e => set('base_price', e.target.value)} required /></label>
        <label className="text-xs font-semibold">Badge<input className={field} maxLength={40} placeholder="New / Bestseller / Limited" value={form.badge} onChange={e => set('badge', e.target.value)} /></label>
        <label className="sm:col-span-2 text-xs font-semibold">Short description<textarea className={field} rows={3} maxLength={500} value={form.short_description} onChange={e => set('short_description', e.target.value)} /></label>
        <label className="sm:col-span-2 text-xs font-semibold">Full product description<textarea className={field} rows={7} maxLength={10000} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Tell the customer what the piece is, how it is made and why it matters." /></label>
      </div>
    </section>

    <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
      <h2 className="font-serif text-2xl">Product details</h2><p className="mt-1 text-sm text-black/55">These fields power the customer-facing details instead of placeholder copy.</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="text-xs font-semibold">Material<input className={field} value={form.material} onChange={e => set('material', e.target.value)} placeholder="Full-grain leather" /></label>
        <label className="text-xs font-semibold">Dimensions<input className={field} value={form.dimensions} onChange={e => set('dimensions', e.target.value)} placeholder="28 × 20 × 10 cm" /></label>
        <label className="text-xs font-semibold">Capacity<input className={field} value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="Fits phone, wallet, keys and small essentials" /></label>
        <label className="text-xs font-semibold">Delivery & returns<input className={field} value={form.delivery_returns} onChange={e => set('delivery_returns', e.target.value)} placeholder="Dispatch in 2–5 working days. Returns within 7 days." /></label>
        <label className="sm:col-span-2 text-xs font-semibold">Care instructions<textarea className={field} rows={3} value={form.care_instructions} onChange={e => set('care_instructions', e.target.value)} placeholder="Keep dry; store in the supplied dust bag." /></label>
        <label className="sm:col-span-2 text-xs font-semibold">Features (one per line)<textarea className={field} rows={5} value={form.features} onChange={e => set('features', e.target.value)} placeholder={'Leather exterior\nLined interior\nInterior pocket\nHand-finished hardware'} /></label>
      </div>
    </section>

    {!form.id && <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#B08A3C]">Photography</p><h2 className="mt-1 font-serif text-2xl">Product photography</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-black/55">Upload up to 8 product photos. The first photo is primary by default; you can choose another primary image before saving.</p></div>
        <span className="shrink-0 rounded-full bg-[#173D32]/8 px-3 py-1.5 text-xs font-semibold text-[#173D32]">{files.length} / {MAX_FILES} images</span>
      </div>

      <div
        role="button" tabIndex={0} aria-label="Upload product images"
        onClick={() => inputRef.current?.click()}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() } }}
        onDragEnter={e => { e.preventDefault(); setDragActive(true) }} onDragOver={e => { e.preventDefault(); setDragActive(true) }} onDragLeave={e => { e.preventDefault(); setDragActive(false) }} onDrop={onDrop}
        className={`mt-6 flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${dragActive ? 'border-[#B08A3C] bg-[#B08A3C]/5' : 'border-black/12 bg-[#F7F3EC]/55 hover:border-[#173D32]/35 hover:bg-[#F7F3EC]'}`}
      >
        <input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" onChange={chooseFiles} className="sr-only" />
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#173D32] text-2xl text-white">＋</span>
        <h3 className="mt-5 text-sm font-semibold">Drag & drop product images</h3><p className="mt-1 text-sm text-black/50">or <span className="font-semibold text-[#173D32]">click to browse</span></p>
        <p className="mt-4 text-[10px] uppercase tracking-[.14em] text-black/40">JPG · PNG · WebP · AVIF &nbsp;•&nbsp; Maximum 10 MB each</p>
        <p className="mt-2 text-xs text-black/45">{files.length === 0 ? '0 / 8 images' : `${files.length} / 8 images selected`}</p>
      </div>

      {previews.length > 0 && <div className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-[.12em]">Selected photography</p><p className="text-xs text-black/45">Click a photo to make it primary</p></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {previews.map((item, index) => <div key={item.id} className={`group relative overflow-hidden rounded-2xl border bg-[#eee9df] ${primaryIndex === index ? 'border-[#B08A3C] ring-2 ring-[#B08A3C]/15' : 'border-black/10'}`}>
            <button type="button" onClick={() => setPrimaryIndex(index)} className="block w-full text-left" aria-label={`Make image ${index + 1} primary`}>
              <div className="aspect-[4/5] overflow-hidden"><img src={item.url} alt={`Product preview ${index + 1}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" /></div>
            </button>
            <div className="flex items-center justify-between gap-2 bg-white px-3 py-2.5">
              <div className="min-w-0"><p className="truncate text-[11px] font-medium">{item.file.name}</p>{primaryIndex === index && <span className="mt-1 inline-flex rounded-full bg-[#173D32] px-2 py-0.5 text-[9px] uppercase tracking-[.1em] text-white">Primary</span>}</div>
              <button type="button" onClick={() => removeFile(index)} className="shrink-0 rounded-full border border-red-200 px-2.5 py-1.5 text-[10px] font-semibold text-red-700 hover:bg-red-50">Remove</button>
            </div>
          </div>)}
        </div>
        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-black/8 bg-[#F7F3EC] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs text-black/55">{files.length} / 8 images selected</span>{files.length < MAX_FILES && <button type="button" onClick={() => inputRef.current?.click()} className="text-left text-xs font-semibold text-[#173D32] hover:underline">＋ Add more images</button>}</div>
      </div>}

      {uploading && <div className="mt-5 rounded-2xl border border-[#173D32]/15 bg-[#173D32]/5 p-4" aria-live="polite">
        <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Uploading photography…</p><p className="mt-1 text-xs text-black/50">{uploadedCount} of {files.length} uploaded</p></div><span className="text-sm font-semibold text-[#173D32]">{files.length ? Math.round((uploadedCount / files.length) * 100) : 0}%</span></div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/8"><div className="h-full rounded-full bg-[#173D32] transition-all duration-300" style={{ width: `${files.length ? (uploadedCount / files.length) * 100 : 0}%` }} /></div>
      </div>}
    </section>}

    <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
      <div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#B08A3C]">Inventory</p><h2 className="mt-1 font-serif text-2xl">Colours & stock</h2><p className="mt-1 text-sm text-black/55">Add every colour customers can choose. Each colour can have its own price and stock.</p></div><button type="button" onClick={addColour} disabled={colours.length >= 8} className="rounded-full bg-[#173D32] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40">＋ Add colour</button></div>
      {colours.length === 0 && <div className="mt-5 rounded-xl border border-dashed border-black/15 p-5 text-sm text-black/50">No colour variants yet. Add a colour if this bag comes in multiple finishes.</div>}
      {colours.map((c, i) => <div key={i} className="mt-4 grid gap-3 rounded-2xl border border-black/10 bg-[#F7F3EC]/45 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-xs font-semibold">Colour name<input className={field} value={c.name} onChange={e => updateColour(i, 'name', e.target.value)} placeholder="Brown" /></label>
        <label className="text-xs font-semibold">Colour<input className={`${field} h-11 p-1.5`} type="color" value={/^#[0-9a-f]{6}$/i.test(c.hex) ? c.hex : '#173D32'} onChange={e => updateColour(i, 'hex', e.target.value)} /></label>
        <label className="text-xs font-semibold">Price<input className={field} type="number" min="0" step="0.01" value={c.price} onChange={e => updateColour(i, 'price', e.target.value)} placeholder={form.base_price || 'Base price'} /></label>
        <label className="text-xs font-semibold">Stock<input className={field} type="number" min="0" step="1" value={c.stock} onChange={e => updateColour(i, 'stock', e.target.value)} /></label>
        <div className="flex items-end gap-3 pb-1"><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={c.available} onChange={e => updateColour(i, 'available', e.target.checked)} /> Available</label><button type="button" onClick={() => removeColour(i)} className="ml-auto rounded-full border border-red-200 px-3 py-2 text-xs text-red-700">Remove</button></div>
        <label className="text-xs font-semibold sm:col-span-2 lg:col-span-3">SKU (optional)<input className={field} value={c.sku} onChange={e => updateColour(i, 'sku', e.target.value)} placeholder="Generated automatically if blank" /></label>
        <label className="flex items-center gap-2 self-end pb-3 text-xs"><input type="checkbox" checked={c.default} onChange={e => setColours(x => x.map((v, n) => ({ ...v, default: n === i ? e.target.checked : false })))} /> Default</label>
      </div>)}
    </section>

    <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#B08A3C]">Publishing</p><h2 className="mt-1 font-serif text-2xl">Storefront</h2><div className="mt-6 grid gap-5 sm:grid-cols-2"><label className="text-xs font-semibold">Status<select className={field} value={form.status} onChange={e => set('status', e.target.value as ProductFormValues['status'])}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label><label className="flex items-center gap-3 rounded-xl border border-black/10 p-4 text-sm"><input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} /> Feature this product</label></div></section>

    <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#B08A3C]">Discovery</p><h2 className="mt-1 font-serif text-2xl">Search metadata</h2><div className="mt-6 grid gap-5"><label className="text-xs font-semibold">SEO title<input className={field} maxLength={70} value={form.seo_title} onChange={e => set('seo_title', e.target.value)} /></label><label className="text-xs font-semibold">SEO description<textarea className={field} rows={3} maxLength={170} value={form.seo_description} onChange={e => set('seo_description', e.target.value)} /></label><label className="text-xs font-semibold">SEO keywords<input className={field} placeholder="leather bag, tote, handmade" value={form.seo_keywords} onChange={e => set('seo_keywords', e.target.value)} /></label></div></section>

    <div className="sticky bottom-4 z-10 rounded-2xl border border-black/10 bg-white/95 p-3 shadow-lg backdrop-blur sm:p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-black/45">{uploading ? `Uploading ${uploadedCount} of ${files.length} images…` : form.id ? 'Changes are saved when you submit.' : 'Review the product and photography before publishing.'}</p><button type="submit" disabled={saving || uploading} className="rounded-full bg-[#173D32] px-6 py-3 text-xs font-bold uppercase tracking-[.13em] text-white transition hover:bg-[#0f2d25] disabled:cursor-not-allowed disabled:opacity-50">{uploading ? 'Uploading photography…' : saving ? 'Saving…' : form.id ? 'Save changes' : 'Create product'}</button></div></div>
  </form>
}
