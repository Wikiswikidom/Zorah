import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { absoluteUrl, safeJsonLd } from '@/lib/seo'

export default async function StoryPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params
  const supabase=await createClient()
  const {data:story}=await supabase.from('journal_articles').select('title,excerpt,body,category,tags,published_at,cover_image_path,seo_title,seo_description').eq('slug',slug).eq('status','published').single()
  if(!story)notFound()
  const coverUrl=story.cover_image_path
    ? (/^https?:\/\//i.test(story.cover_image_path)||story.cover_image_path.startsWith('/') ? story.cover_image_path : supabase.storage.from('landing-media').getPublicUrl(story.cover_image_path).data.publicUrl)
    : null
  const article={'@context':'https://schema.org','@type':'Article','headline':story.title,'description':story.seo_description||story.excerpt||'Zorah Journal story on leather, design and Lagos.','datePublished':story.published_at||undefined,'author':{'@type':'Organization','name':'Zorah Handbags','url':absoluteUrl('/landing')},'publisher':{'@type':'Organization','name':'Zorah Handbags','url':absoluteUrl('/landing')},'mainEntityOfPage':absoluteUrl(`/journal/${slug}`),...(coverUrl?{image:[coverUrl]}:{})}
  const paragraphs=String(story.body||'').split(/\n\s*\n/).map((p:string)=>p.trim()).filter(Boolean)
  const readMinutes=Math.max(1,Math.ceil(String(story.body||'').length/900))
  return <main className="min-h-screen bg-[#F7F3EC] text-[#111]"><div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
    <Link href="/journal" className="text-[10px] font-semibold uppercase tracking-[.17em] text-[#173D32]">← Back to Journal</Link>
    <header className="mx-auto max-w-3xl pb-10 pt-10 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#5A3524]">{story.category||"Z' Stories"}{story.published_at?` · ${new Date(story.published_at).getFullYear()}`:''} · {readMinutes} min read</p>
      <h1 className="mt-4 font-serif text-5xl leading-[.94] sm:text-6xl lg:text-7xl">{story.title}</h1>
      {story.excerpt&&<p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-black/60">{story.excerpt}</p>}
    </header>
    {coverUrl&&<figure className="overflow-hidden rounded-[2rem] border border-black/10 bg-[#DED5C8]"><img src={coverUrl} alt="" className="max-h-[70vh] w-full object-cover"/></figure>}
    <article className="mx-auto max-w-2xl py-12 sm:py-16">
      <div className="space-y-7 text-[17px] leading-8 text-black/75">{paragraphs.map((paragraph:string,index:number)=><p key={index}>{paragraph}</p>)}</div>
      {!!story.tags?.length&&<div className="mt-12 flex flex-wrap gap-2 border-t border-black/10 pt-7">{story.tags.map((tag:string)=><span key={tag} className="rounded-full border border-black/10 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[.12em] text-black/50">#{tag}</span>)}</div>}
    </article>
    <div className="border-t border-black/10 py-8 text-center"><p className="text-[10px] uppercase tracking-[.18em] text-black/40">More from Zorah</p><Link href="/shop" className="mt-3 inline-block font-serif text-3xl">Explore the collection →</Link></div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJsonLd(article)}}/>
  </div></main>
}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params
  const supabase=await createClient()
  const {data:story}=await supabase.from('journal_articles').select('title,excerpt,seo_title,seo_description,cover_image_path').eq('slug',slug).eq('status','published').single()
  const title=story?.seo_title||story?.title||'Zorah Journal'
  const description=story?.seo_description||story?.excerpt||'Stories from Zorah about leather, design, craftsmanship and Lagos.'
  const image=story?.cover_image_path?(story.cover_image_path.startsWith('/')||/^https?:\/\//i.test(story.cover_image_path)?story.cover_image_path:supabase.storage.from('landing-media').getPublicUrl(story.cover_image_path).data.publicUrl):undefined
  return {title,description,alternates:{canonical:`/journal/${slug}`},openGraph:{title,description,type:'article',url:absoluteUrl(`/journal/${slug}`),images:image?[{url:image}]:undefined}}
}
