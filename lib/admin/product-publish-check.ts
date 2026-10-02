import { createClient } from '@/lib/supabase/server'

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export type ProductPublishCheck = {
  ready: boolean
  issues: string[]
}

export async function getProductPublishCheck(productId: string): Promise<ProductPublishCheck> {
  const supabase = await createClient()

  const [{ data: product }, { data: category }, { data: variants }, { data: images }] = await Promise.all([
    supabase.from('products').select('name,slug,description,base_price,category_id').eq('id', productId).maybeSingle(),
    supabase.from('products').select('category_id,categories!inner(id,is_active)').eq('id', productId).maybeSingle(),
    supabase.from('product_variants').select('sku,price,is_available,stock_quantity').eq('product_id', productId),
    supabase.from('product_images').select('is_primary').eq('product_id', productId),
  ])

  const issues: string[] = []

  if (!product) return { ready: false, issues: ['Product could not be found.'] }
  if (product.name.trim().length < 2) issues.push('Product name is missing.')
  if (!SLUG.test(product.slug)) issues.push('Product slug is invalid.')
  if (!product.description?.trim()) issues.push('Product description is missing.')
  if (!Number.isFinite(Number(product.base_price)) || Number(product.base_price) <= 0) issues.push('Product price must be greater than zero.')
  if (!product.category_id || !category?.categories?.is_active) issues.push('An active product category is required.')

  const hasPrimaryImage = (images ?? []).some(image => image.is_primary === true)
  if (!hasPrimaryImage) issues.push('A primary product image is required.')

  const hasSellableVariant = (variants ?? []).some(variant =>
    typeof variant.sku === 'string' &&
    variant.sku.trim().length >= 3 &&
    Number.isFinite(Number(variant.price)) &&
    Number(variant.price) > 0 &&
    variant.is_available === true
  )

  if (!hasSellableVariant) issues.push('At least one available variant with a valid SKU and price is required.')

  return { ready: issues.length === 0, issues }
}
