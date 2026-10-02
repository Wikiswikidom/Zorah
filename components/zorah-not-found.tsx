import Link from 'next/link'

export function ZorahNotFound({ admin = false }: { admin?: boolean }) {
  return (
    <main className="min-h-[100svh] bg-[#F7F3EC] px-6 py-10 text-[#111]">
      <div className="mx-auto grid min-h-[calc(100svh-5rem)] w-full max-w-5xl place-items-center">
        <section className="w-full max-w-2xl border border-black/10 bg-white px-7 py-12 text-center shadow-[0_24px_80px_rgba(17,17,17,.08)] sm:px-12 sm:py-16">
          <p className="mb-8 text-[10px] font-bold uppercase tracking-[.28em] text-[#B08A3C]">Zorah Handbags</p>
          <div className="mx-auto mb-8 grid h-16 w-16 place-items-center rounded-full border border-[#173D32]/20 bg-[#173D32] font-serif text-2xl text-[#F7F3EC]">Z</div>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-black/45">404 / Page unavailable</p>
          <h1 className="mt-4 font-serif text-5xl font-normal tracking-[-.035em] sm:text-6xl">We couldn't find that page.</h1>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-black/55">The page you're looking for isn't available. If you're trying to manage your Zorah account, continue to customer login.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/login" className="inline-flex min-h-11 items-center justify-center bg-[#173D32] px-6 text-[10px] font-bold uppercase tracking-[.15em] text-[#F7F3EC]">Customer Login</Link>
            <Link href="/" className="inline-flex min-h-11 items-center justify-center border border-black/15 px-6 text-[10px] font-bold uppercase tracking-[.15em] text-[#111]">Return Home</Link>
          </div>
          {admin && <p className="mt-8 text-[10px] uppercase tracking-[.12em] text-black/35">Zorah commerce workspace</p>}
        </section>
      </div>
    </main>
  )
}
