import Link from 'next/link'
import { requireRole } from '@/lib/auth/authorization'
import CollectionForm from '../collection-form'

export default async function NewCollectionPage(){ await requireRole(['catalog_admin']); return <main className="min-h-screen bg-[#F7F3EC] p-5 text-[#111111] sm:p-10"><div className="mx-auto max-w-3xl"><Link href="/admin/collections" className="text-xs uppercase tracking-[.16em] text-[#173D32]">← Collections</Link><h1 className="mt-6 font-serif text-4xl">New collection</h1><p className="mt-2 text-sm text-black/60">Create a curated collection and assign products after saving.</p><div className="mt-8"><CollectionForm /></div></div></main>}
