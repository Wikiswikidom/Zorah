import Link from 'next/link'

export function AuthLanding(){
  return <main className="auth-landing">
    <section className="auth-landing-card" aria-label="Zorah welcome">
      <div className="auth-landing-mark">Z</div>
      <p className="auth-landing-kicker">Zorah Handbags · Lagos</p>
      <h1>Welcome to Zorah.</h1>
      <p className="auth-landing-copy">Discover handcrafted leather bags, save your favourites, track orders and shop the collection.</p>
      <div className="auth-landing-actions">
        <Link href="/login" className="auth-landing-primary">Login</Link>
        <Link href="/login?mode=signup" className="auth-landing-secondary">Sign up</Link>
      </div>
    </section>
  </main>
}
