import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Zorah Journal | Leather, Design & Lagos',
  description: 'Read Zorah stories about leathercraft, handbag design, Lagos, materials, craftsmanship and the people behind each piece.',
  alternates: { canonical: '/journal' },
  openGraph: {
    title: 'Zorah Journal | Leather, Design & Lagos',
    description: 'Stories about leathercraft, handbag design, Lagos and the people behind Zorah.',
    type: 'website',
  },
}

function imageUrl(supabase: Awaited<ReturnType<typeof createClient>>, path: string | null) {
  if (!path) return null
  if (/^https?:\/\//i.test(path) || path.startsWith('/')) return path
  return supabase.storage.from('landing-media').getPublicUrl(path).data.publicUrl || null
}

export default async function JournalPage() {
  const supabase = await createClient()
  const { data: stories } = await supabase
    .from('journal_articles')
    .select('id,slug,title,excerpt,body,category,tags,cover_image_path,published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(24)

  const articles = (stories ?? []).map(story => ({
    ...story,
    coverUrl: imageUrl(supabase, story.cover_image_path),
    year: story.published_at ? new Date(story.published_at).getFullYear() : null,
    readMinutes: Math.max(1, Math.ceil((story.body?.length ?? 0) / 900)),
  }))
  const featured = articles[0]
  const rest = articles.slice(1)

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#111]">
      <div className="page-shell">
        <div className="mx-auto max-w-7xl px-5 pb-8 pt-12 sm:px-8 sm:pt-16">
          <p className="eyebrow">Z&apos; Stories</p>
          <div className="mt-3 flex flex-col gap-5 border-b border-black/10 pb-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="page-title">The Zorah Journal</h1>
              <p className="page-lede max-w-2xl">Notes on leather, design, Lagos, craftsmanship and the people behind the pieces.</p>
            </div>
            <Link href="/shop" className="inline-flex w-fit rounded-full border border-[#173D32] px-5 py-3 text-[10px] font-semibold uppercase tracking-[.16em] text-[#173D32]">
              Explore the collection →
            </Link>
          </div>

          {!featured ? (
            <section className="mx-auto max-w-3xl py-20 text-center sm:py-28">
              <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#5A3524]">Coming soon</p>
              <h2 className="mt-4 font-serif text-4xl sm:text-5xl">Stories are being made.</h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-black/60">
                The Zorah Journal will document the materials, techniques, places and ideas behind the house.
              </p>
              <Link href="/shop" className="mt-7 inline-flex rounded-full bg-[#173D32] px-6 py-3 text-[10px] font-semibold uppercase tracking-[.16em] text-white">
                Discover Zorah
              </Link>
            </section>
          ) : (
            <>
              <section className="grid gap-8 py-10 lg:grid-cols-[1.45fr_.8fr] lg:items-end">
                <Link href={`/journal/${featured.slug}`} className="group block overflow-hidden rounded-[2rem] border border-black/10 bg-white">
                  <div className="relative aspect-[16/9] overflow-hidden bg-[#DED5C8]">
                    {featured.coverUrl ? (
                      <img src={featured.coverUrl} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                    ) : (
                      <div className="flex h-full items-end bg-gradient-to-br from-[#d9c7b2] via-[#efe8de] to-[#8a6b52] p-8">
                        <span className="font-serif text-4xl text-white/90">Zorah</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 sm:p-8">
                    <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#5A3524]">
                      {featured.category || "Z' Stories"}{featured.year ? ` · ${featured.year}` : ''} · {featured.readMinutes} min read
                    </p>
                    <h2 className="mt-3 font-serif text-4xl leading-[.98] sm:text-5xl">{featured.title}</h2>
                    {featured.excerpt && <p className="mt-4 max-w-2xl text-sm leading-7 text-black/60">{featured.excerpt}</p>}
                    <span className="mt-6 inline-block text-[10px] font-semibold uppercase tracking-[.16em] text-[#173D32]">Read story →</span>
                  </div>
                </Link>

                <aside className="border-t border-black/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-black/40">Inside the journal</p>
                  <div className="mt-5 space-y-5 text-sm leading-6 text-black/65">
                    <p>Material notes, studio observations, Lagos references and the details that make a Zorah piece feel considered.</p>
                    <p>Every story is written to stand on its own — more like a fashion journal than a product catalogue.</p>
                  </div>
                  <Link href="/our-story" className="mt-7 inline-block text-[10px] font-semibold uppercase tracking-[.16em] text-[#173D32]">Meet the house →</Link>
                </aside>
              </section>

              {rest.length > 0 && (
                <section className="border-t border-black/10 py-10">
                  <div className="mb-6 flex items-end justify-between gap-4">
                    <div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-black/40">More from Zorah</p><h2 className="mt-2 font-serif text-3xl sm:text-4xl">Latest stories</h2></div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {rest.map(story => (
                      <article key={story.id} className="group overflow-hidden rounded-2xl border border-black/10 bg-white">
                        <Link href={`/journal/${story.slug}`}>
                          <div className="aspect-[4/3] overflow-hidden bg-[#DED5C8]">
                            {story.coverUrl ? <img src={story.coverUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" /> : <div className="h-full bg-gradient-to-br from-[#eee7dc] to-[#b79b7e]" />}
                          </div>
                          <div className="p-5">
                            <p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#5A3524]">{story.category || "Z' Stories"}{story.year ? ` · ${story.year}` : ''}</p>
                            <h3 className="mt-2 font-serif text-2xl leading-tight">{story.title}</h3>
                            {story.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-6 text-black/55">{story.excerpt}</p>}
                            <span className="mt-4 inline-block text-[10px] font-semibold uppercase tracking-[.16em] text-[#173D32]">Read →</span>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
