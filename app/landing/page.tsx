import type { Metadata } from 'next'
import StorefrontHome from '@/components/landing/storefront-home'
import SiteJsonLd from '@/components/seo/site-json-ld'
import { defaultDescription, defaultKeywords } from '@/lib/seo'
import '../landing.css'
import '../landing-responsive.css'
import '../landing-cms.css'
import './landing-public.css'
import './landing-contact.css'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
 title: 'Zorah Handbags — Contemporary Leather Handbags Crafted in Lagos',
 description: defaultDescription,
 keywords: defaultKeywords,
 alternates: { canonical: '/landing' },
 openGraph: { title: 'Zorah Handbags — Contemporary Leather Handbags Crafted in Lagos', description: defaultDescription, url: '/landing', type: 'website' },
}
export default function LandingPage(){ return <div className="landing-public"><SiteJsonLd/><StorefrontHome /></div> }
