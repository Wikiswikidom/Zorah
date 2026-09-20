const FALLBACK_SITE_URL = 'http://localhost:3000'

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '')
  if (configured) return configured
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, '').replace(/\/$/, '')}`
  return FALLBACK_SITE_URL
}

export const siteName = 'Zorah Handbags'
export const siteTagline = 'Crafted to be carried.'
export const defaultTitle = 'Zorah Handbags — Crafted to be carried.'
export const defaultDescription =
  'Zorah Handbags is a Lagos, Nigeria leather atelier creating contemporary handcrafted leather handbags with a modern African point of view.'
export const defaultKeywords = [
  'Zorah Handbags',
  'Zorah',
  'Zorah Atelier',
  'Zorah Lagos',
  'Zorah handbags',
  'leather handbags',
  'leather bags',
  'handbags Nigeria',
  'Nigerian handbags',
  'Lagos handbags',
  'Lagos leather bags',
  'leather handbag Nigeria',
  'handcrafted handbags',
  'handcrafted leather bags',
  'designer handbags Nigeria',
  'African fashion bags',
  'leathercraft Lagos',
  'leather craftsmanship Nigeria',
]

export function absoluteUrl(path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${getSiteUrl()}${clean}`
}

export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
