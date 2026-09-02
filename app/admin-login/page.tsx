import Link from 'next/link'
import { signInWithPassword } from '@/app/login/actions'
import { AdminLoginForm } from '@/components/admin/admin-login-form'
import './login.css'

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  return <main className="admin-login-page">
    <section className="admin-login-brand"><Link href="/" className="admin-login-logo"><img src="/brand/zorah-logo.webp" alt="Zorah Handbags" /></Link><p>Private commerce workspace</p><div><span>OPERATIONS</span><h1>Run the house<br /><em>behind the house.</em></h1><p>Secure access for approved Zorah administrators. Customers should use the normal account sign-in.</p></div></section>
    <section className="admin-login-form-wrap"><div className="admin-login-form-inner"><div><span className="admin-login-kicker">Zorah / Admin</span><h2>Sign in</h2><p>Use an approved administrator account to continue.</p></div>{params.error === 'invalid' && <div className="admin-login-alert">The email or password is incorrect.</div>}{params.error === 'rate_limit' && <div className="admin-login-alert">Too many attempts. Please wait and try again.</div>}{params.error === 'email_not_confirmed' && <div className="admin-login-alert">This admin account has not been confirmed.</div>}{params.error === 'forbidden' && <div className="admin-login-alert">This account does not have administrator access.</div>}<AdminLoginForm action={signInWithPassword} /><div className="admin-login-footer"><Link href="/login">← Customer sign in</Link><Link href="/">Back to Zorah ↗</Link></div></div></section>
  </main>
}
