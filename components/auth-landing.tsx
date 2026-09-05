import Link from 'next/link'

export function AuthLanding(){
  return <main className="auth-landing" aria-label="Zorah authentication">
    <section className="auth-landing-card">
      <div className="auth-landing-mark">Z</div>
      <h1>ZORAH</h1>
      <div className="auth-landing-actions">
        <Link href="/login" className="auth-landing-primary">Login</Link>
        <Link href="/login?mode=signup" className="auth-landing-secondary">Sign up</Link>
      </div>
    </section>
  </main>
}
