import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
export const metadata: Metadata = { title: 'Search | Zorah Handbags', robots: { index: false, follow: true } }
export default async function SearchPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const p=await searchParams;const q=typeof p.q==='string'?p.q.trim().slice(0,80):'';redirect(q?`/shop?q=${encodeURIComponent(q)}`:'/shop')}
