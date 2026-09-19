import { absoluteUrl, defaultDescription, safeJsonLd, siteName } from '@/lib/seo'

export default function SiteJsonLd() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: absoluteUrl('/landing'),
    logo: absoluteUrl('/icon'),
    description: defaultDescription,
    areaServed: 'NG',
    brand: { '@type': 'Brand', name: siteName },
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: absoluteUrl('/landing'),
    description: defaultDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absoluteUrl('/search')}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(organization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(website) }} />
    </>
  )
}
