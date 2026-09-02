import { signInWithGoogle, signInWithPassword, signUpWithPassword } from './actions'

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const next = typeof params.next === 'string' && params.next.startsWith('/') && !params.next.startsWith('//') ? params.next : '/account'
  const error = typeof params.error === 'string' ? params.error : ''
  const message = typeof params.message === 'string' ? params.message : ''
  const signupOpen = error.startsWith('signup') || params.mode === 'signup'

  return (
    <main className="login-page">
      <section className="login-brand" aria-label="Zorah brand">
        <div className="login-brand-top"><a href="/" aria-label="Zorah home"><img className="login-brand-logo" src="/brand/zorah-wordmark.svg" alt="Zorah" /></a><a className="login-brand-link" href="/shop">Enter shop ↗</a></div>
        <div className="login-brand-copy"><p className="login-kicker">Zorah Handbags · Lagos</p><h1>Come in.<br /><em>Stay awhile.</em></h1><p>Your account is where your Zorah collection, orders and saved pieces come together.</p></div>
        <div className="login-brand-bottom"><span>Crafted to be carried</span><span>Lagos · Nigeria</span></div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <a className="login-back" href="/">← Back to Zorah</a>
          <h2>{signupOpen ? 'Create your account' : 'Welcome back'}</h2>
          <p>{signupOpen ? 'Join Zorah and keep your collection close.' : 'Sign in to manage your account, orders and saved pieces.'}</p>

          {message === 'check_email' && <div className="login-alert">Your account is almost ready. Check your email to confirm it.</div>}
          {error && <div className="login-alert login-alert--error">{error === 'oauth' ? 'Google sign-in could not start. Please check the Google connection or use email and password.' : error === 'configuration' ? 'Sign-in is temporarily unavailable because the site URL is not configured.' : 'We could not complete that request. Please check your details and try again.'}</div>}

          {!signupOpen && <>
            <form action={signInWithGoogle}>
              <input type="hidden" name="next" value={next} />
              <button className="login-google" type="submit"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.27c0-.7-.06-1.38-.18-2.03H12v3.84h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.2Z"/><path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.55 0-4.71-1.72-5.48-4.04H3.27v2.53A9.75 9.75 0 0 0 12 21.75Z"/><path fill="#FBBC05" d="M6.52 13.82a5.86 5.86 0 0 1 0-3.64V7.65H3.27a9.75 9.75 0 0 0 0 8.7l3.25-2.53Z"/><path fill="#EA4335" d="M12 6.14c1.43 0 2.72.49 3.74 1.45l2.8-2.8C16.83 3.14 14.62 2.25 12 2.25a9.75 9.75 0 0 0-8.73 5.4l3.25 2.53C7.29 7.86 9.45 6.14 12 6.14Z"/></svg> Continue with Google</button>
            </form>
            <div className="login-divider"><i />or<i /></div>
            <form action={signInWithPassword} className="login-form">
              <input type="hidden" name="next" value={next} />
              <div className="login-field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={320} /></div>
              <div className="login-field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required maxLength={1024} /></div>
              <button className="login-submit" type="submit">Sign in</button>
            </form>
          </>}

          <details className="login-register" open={signupOpen}>
            <summary>{signupOpen ? 'Already have an account? Sign in above.' : 'New to Zorah? Create an account'}</summary>
            {!signupOpen && <div className="login-note">Your account uses Supabase Auth. Passwords are never stored in the browser.</div>}
            <form action={signUpWithPassword} className="login-form">
              <input type="hidden" name="next" value={next} />
              <div className="login-field"><label htmlFor="fullName">Full name</label><input id="fullName" name="fullName" type="text" autoComplete="name" maxLength={160} /></div>
              <div className="login-field"><label htmlFor="signupEmail">Email</label><input id="signupEmail" name="email" type="email" autoComplete="email" required maxLength={320} /></div>
              <div className="login-field"><label htmlFor="signupPassword">Password</label><input id="signupPassword" name="password" type="password" autoComplete="new-password" required minLength={10} maxLength={1024} /></div>
              <button className="login-submit" type="submit">Create account</button>
            </form>
          </details>

          <div className="login-footer-links"><a href="/shop">Shop</a><a href="/our-story">Our story</a><a href="/help">Help</a></div>
        </div>
      </section>
    </main>
  )
}
