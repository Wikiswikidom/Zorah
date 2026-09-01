import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/authorization'
import { createClient } from '@/lib/supabase/server'
import JournalForm from '../journal-form'

export default async function EditJournalPage({params}:{params:Promise<{id:string}>}){await requireRole(['content_admin','marketing_admin','super_admin']);const {id}=await params;const supabase=await createClient();const {data:article}=await supabase.from('journal_articles').select('*').eq('id',id).single();if(!article)notFound();return <main className="min-h-screen bg-[#F7F3EC] text-[#111111]"><header className="border-b border-black/10 bg-[#111111] px-5 py-5 text-[#F7F3EC]"><div className="mx-auto flex max-w-5xl items-center justify-between"><Link href="/admin/journal" className="font-serif text-2xl tracking-[.12em]">ZORAH</Link><Link href="/journal" className="text-xs uppercase tracking-[.15em] text-white/70">View journal</Link></div></header><section className="mx-auto max-w-5xl px-5 py-10 sm:px-8"><p className="text-xs uppercase tracking-[.2em] text-[#5A3524]">2D-7 · Edit story</p><h1 className="mt-2 font-serif text-4xl">{article.title}</h1><JournalForm mode="edit" article={article} userId={article.updated_by ?? ''}/></section></main>}
