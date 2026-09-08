import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthSubmitButton } from '@/components/auth-submit-button'
import { StorefrontHeader } from '@/components/storefront-header'
import { updatePassword } from './actions'

const errors: Record<string, string> = {
  weak: 'Your new password must be at least 10 characters long.',
  mismatch: 'The passwords do not match. Please enter them again.',
  same: 'Choose a password different from your current password.',
  failed: 'We could not update your password. Please request a new reset link and try again.',
}

export default async function UpdatePasswordPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/account/update-password')

  const params = await searchParams
  const error = params.error ? errors[params.error] : ''

  return <main className="login-page password-update-page">
    <section className="login-brand" aria-label="Zorah brand">
      <div className="login-brand-top"><Link href="/" aria-label="Zorah home"><img className="login-brand-logo" src="/brand/zorah-wordmark.svg" alt="Zorah" /></Link><span className="login-brand-link">Account security</span></div>
      <div className="login-brand-copy"><p className="login-kicker">Zorah Handbags · Secure account</p><h1>Keep it<br/><em>private.</em></h1><p>Choose a strong password you do not reuse on another website.</p></div>
      <div className="login-brand-bottom"><span>Secure customer access</span><span>Lagos · Nigeria</span></div>
    </section>
    <section className="login-panel"><div className="login-card">
      <Link className="login-back" href="/account">← Back to account</Link>
      <h2>Choose a new password</h2>
      <p>Update the password for {user.email}.</p>
      {params.message === 'updated' && <div className="login-alert login-alert--success"><strong>Password updated.</strong> Your account password has been changed successfully.</div>}
      {error && <div className="login-alert login-alert--error"><strong>{error}</strong></div>}
      <form action={updatePassword} className="login-form">
        <div className="login-field"><label htmlFor="newPassword">New password</label><input id="newPassword" name="password" type="password" autoComplete="new-password" minLength={10} maxLength={1024} required/><small className="login-password-hint">Use 10 or more characters and avoid reused passwords.</small></div>
        <div className="login-field"><label htmlFor="confirmPassword">Confirm new password</label><input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={10} maxLength={1024} required/></div>
        <AuthSubmitButton className="login-submit" pendingLabel="Updating password…">Update password</AuthSubmitButton>
      </form>
      <div className="login-footer-links"><Link href="/account">Account</Link><Link href="/help">Help</Link><Link href="/terms-and-conditions">Terms</Link></div>
    </div></section>
  </main>
}
