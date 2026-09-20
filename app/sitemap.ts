import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { absoluteUrl } from '@/lib/seo'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const [{ data: products }, { data: stories }] = await Promise.all([
    supabase.from('products').select('slug,updated_at').eq('status', 'published').limit(5000),
    supabase.from('journal_articles').select('slug,published_at,updated_at').eq('status', 'published').limit(5000),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/landing'), changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/shop'), changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/collections'), changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/our-story'), changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/custom-orders'), changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/journal'), changeFrequency: 'weekly', priority: 0.7 },
  ]

  const productPages = (products ?? []).map(product => ({
    url: absoluteUrl(`/products/${product.slug}`),
    lastModified: product.updated_at ? new Date(product.updated_at) : undefined,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const journalPages = (stories ?? []).map(story => ({
    url: absoluteUrl(`/journal/${story.slug}`),
    lastModified: story.updated_at || story.published_at ? new Date(story.updated_at || story.published_at) : undefined,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...productPages, ...journalPages]
}
