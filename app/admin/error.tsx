'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('Commerce Studio error', error) }, [error])

  return (
    <main className="min-h-[70vh] bg-[#F7F3EC] px-6 py-12 text-[#111]">
      <section className="mx-auto max-w-xl border border-black/10 bg-white p-8 text-center shadow-[0_20px_70px_rgba(17,17,17,.07)] sm:p-12">
        <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#B08A3C]">Zorah / Commerce Studio</p>
        <h1 className="mt-4 font-serif text-4xl tracking-[-.03em]">Something went wrong.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-black/55">The workspace could not complete that request. Your data was not reported as changed by this error.</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={() => reset()} className="min-h-11 bg-[#173D32] px-6 text-[10px] font-bold uppercase tracking-[.15em] text-[#F7F3EC]">Try again</button>
          <Link href="/admin" className="inline-flex min-h-11 items-center justify-center border border-black/15 px-6 text-[10px] font-bold uppercase tracking-[.15em]">Dashboard</Link>
        </div>
      </section>
    </main>
  )
}
