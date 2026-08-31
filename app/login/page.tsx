import { signInWithGoogle, signInWithPassword, signUpWithPassword } from './actions'

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const next = typeof params.next === 'string' && params.next.startsWith('/') && !params.next.startsWith('//') ? params.next : '/account'
  const error = typeof params.error === 'string' ? params.error : ''
  const message = typeof params.message === 'string' ? params.message : ''

  return (
    <main className="min-h-screen bg-[#F7F3EC] px-5 py-16 text-[#111111]">
      <div className="mx-auto max-w-md">
        <a href="/" className="font-serif text-3xl tracking-[0.14em]">ZORAH</a>
        <h1 className="mt-12 font-serif text-4xl">Welcome back</h1>
        <p className="mt-3 text-sm leading-6 text-black/60">Sign in to manage your account, orders and saved pieces.</p>

        {message === 'check_email' && <p className="mt-6 rounded-xl bg-[#173D32]/10 p-4 text-sm">Check your email to confirm your account.</p>}
        {error && <p className="mt-6 rounded-xl bg-red-950/10 p-4 text-sm">We could not complete that request. Please try again.</p>}

        <form action={signInWithGoogle} className="mt-8">
          <input type="hidden" name="next" value={next} />
          <button className="w-full rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-medium">Continue with Google</button>
        </form>

        <div className="my-7 flex items-center gap-4 text-xs uppercase tracking-[0.18em] text-black/35"><span className="h-px flex-1 bg-black/10" />or<span className="h-px flex-1 bg-black/10" /></div>

        <form action={signInWithPassword} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <label className="block text-sm">Email<input name="email" type="email" autoComplete="email" required maxLength={320} className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#B08A3C]" /></label>
          <label className="block text-sm">Password<input name="password" type="password" autoComplete="current-password" required maxLength={1024} className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#B08A3C]" /></label>
          <button className="w-full rounded-full bg-[#111111] px-5 py-3 text-sm text-[#F7F3EC]">Sign in</button>
        </form>

        <details className="mt-10 rounded-xl border border-black/10 bg-white/50 p-5">
          <summary className="cursor-pointer text-sm font-medium">Create an account</summary>
          <form action={signUpWithPassword} className="mt-5 space-y-4">
            <label className="block text-sm">Full name<input name="fullName" type="text" autoComplete="name" maxLength={160} className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3" /></label>
            <label className="block text-sm">Email<input name="email" type="email" autoComplete="email" required maxLength={320} className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3" /></label>
            <label className="block text-sm">Password<input name="password" type="password" autoComplete="new-password" required minLength={10} maxLength={1024} className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3" /></label>
            <button className="w-full rounded-full border border-[#111111] px-5 py-3 text-sm">Create account</button>
          </form>
        </details>
      </div>
    </main>
  )
}
