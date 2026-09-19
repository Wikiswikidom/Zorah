import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/landing', '/shop', '/products/', '/collections', '/journal/'],
        disallow: ['/admin', '/admin-login', '/account', '/checkout', '/login', '/signup', '/search', '/api/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
