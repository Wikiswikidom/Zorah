import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/authorization'
import { createClient } from '@/lib/supabase/server'
import VariantManager from '../variant-manager'

export default async function ProductVariantsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(['catalog_admin'])
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase.from('products').select('id,name,slug,base_price,currency').eq('id', id).single()
  if (!product) notFound()
  const { data: variants, error } = await supabase
    .from('product_variants')
    .select('id,product_id,sku,name,color_name,color_hex,price,stock_quantity,is_available,is_default,created_at,updated_at')
    .eq('product_id', id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true })

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#111111]">
      <header className="border-b border-black/10 bg-[#111111] text-[#F7F3EC]"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8"><div><Link href="/admin/products" className="font-serif text-2xl tracking-[.12em]">ZORAH</Link><p className="mt-1 text-[10px] uppercase tracking-[.25em] text-[#B08A3C]">Variant manager</p></div><Link href={`/admin/products/${product.id}`} className="text-xs uppercase tracking-[.15em] text-white/70">Back to product</Link></div></header>
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14"><p className="text-xs uppercase tracking-[.2em] text-[#5A3524]">2D-3C</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">{product.name} variants</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-black/60">Manage purchasable colours, SKUs, variant pricing, stock and availability. The server remains the authority for validation and authorization.</p><div className="mt-8"><VariantManager productId={product.id} initial={variants ?? []} /></div>{error&&<p className="mt-3 text-xs text-red-800">Some variant data could not be loaded. Refresh and try again.</p>}</section>
    </main>
  )
}
