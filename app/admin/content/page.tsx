import Link from 'next/link'
import { requireRole } from '@/lib/auth/authorization'
import ContentEditor from './content-editor'

export default async function AdminContentPage() {
  await requireRole(['content_admin', 'marketing_admin'])
  return <main className="min-h-screen bg-[#F7F3EC] text-[#111111]"><header className="border-b border-black/10 bg-[#111111] text-[#F7F3EC]"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8"><div><Link href="/admin" className="font-serif text-2xl tracking-[.12em]">ZORAH</Link><p className="mt-1 text-[10px] uppercase tracking-[.25em] text-[#B08A3C]">Landing page CMS</p></div><Link href="/" className="text-xs uppercase tracking-[.18em] text-white/75">View store</Link></div></header><section className="mx-auto max-w-7xl px-5 py-10 sm:px-8"><div className="max-w-3xl"><p className="text-xs uppercase tracking-[.2em] text-[#5A3524]">2D-5</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">Landing page</h1><p className="mt-3 text-sm leading-7 text-black/65">Edit approved content blocks without editing HTML or design code. Changes are validated server-side and unpublished content stays out of the public store.</p></div><div className="mt-8"><ContentEditor /></div></section></main>
}
