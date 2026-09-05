import type { Metadata } from 'next'
import StorefrontHome from '@/components/landing/storefront-home'
import './landing.css'
import '../landing-responsive.css'
import '../landing-cms.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Zorah Handbags — Crafted to be carried.',
  description: 'Zorah leather handbags, crafted in Lagos and designed for real life.',
}

export default function LandingPage(){
  return <StorefrontHome />
}
