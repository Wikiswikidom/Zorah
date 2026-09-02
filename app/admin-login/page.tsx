import Link from 'next/link'
import { adminPasswordSignIn } from './actions'
import { AdminLoginForm } from '@/components/admin/admin-login-form'
import './login.css'

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  return <main className="admin-login-page">
    <section className="admin-login-brand"><Link href="/" className="admin-login-logo"><img src="/brand/zorah-logo.webp" alt="Zorah Handbags" /></Link><p>Private commerce workspace</p><div><span>OPERATIONS</span><h1>Run the house<br /><em>behind the house.</em></h1><p>Secure access for approved Zorah administrators. Customers should use the normal account sign-in.</p></div></section>
    <section className="admin-login-form-wrap"><div className="admin-login-form-inner"><div><span className="admin-login-kicker">Zorah / Admin</span><h2>Sign in</h2><p>Use an approved administrator account to continue.</p></div>{params.error === 'invalid' && <div className="admin-login-alert">The email or password is incorrect.</div>}{params.error === 'not_staff' && <div className="admin-login-alert">This account does not have an active administrator role.</div>}{params.error === 'not_staff_verified' && <div className="admin-login-alert">This staff account has not been activated yet. A Super Admin must assign its staff role.</div>}{params.error === 'forbidden' && <div className="admin-login-alert">This account does not have permission to open that workspace.</div>}<AdminLoginForm action={adminPasswordSignIn} /><div className="admin-login-footer"><Link href="/login">← Customer sign in</Link><Link href="/">Back to Zorah ↗</Link></div></div></section>
  </main>
}
