'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type TotpFactor = {
  id: string
  friendly_name?: string | null
  status: string
  created_at?: string
}

type Enrollment = {
  id: string
  qrCode: string
  secret: string
}

export function AdminMfaManagement() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [factors, setFactors] = useState<TotpFactor[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const reloadFactors = useCallback(async () => {
    const result = await supabase.auth.mfa.listFactors()
    if (result.error) throw result.error
    setFactors((result.data.totp || []) as TotpFactor[])
  }, [supabase])

  useEffect(() => {
    let active = true
    void supabase.auth.mfa.listFactors().then(({ data, error: listError }) => {
      if (!active) return
      if (listError) setError('Could not load authenticator factors. Reload this page and try again.')
      else setFactors((data.totp || []) as TotpFactor[])
      setLoading(false)
    })
    return () => { active = false }
  }, [supabase])

  async function startEnrollment() {
    setBusy(true); setError(''); setMessage('')
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      issuer: 'Zorah Commerce Studio',
      friendlyName: 'Zorah Owner Authenticator',
    })
    if (enrollError || !data?.totp) {
      setError(enrollError?.message || 'Could not start authenticator enrollment. Please try again.')
      setBusy(false)
      return
    }
    setEnrollment({ id: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret })
    setCode('')
    setMessage('Scan this new QR code using the owner’s own phone. Keep the existing authenticator enrolled until the new one is verified and tested.')
    setBusy(false)
  }

  async function verifyEnrollment() {
    if (!enrollment || !/^\\d{6}$/.test(code)) {
      setError('Enter the current six-digit code shown by the owner’s authenticator app.')
      return
    }
    setBusy(true); setError(''); setMessage('')
    const challenge = await supabase.auth.mfa.challenge({ factorId: enrollment.id })
    if (challenge.error || !challenge.data?.id) {
      setError('Could not start verification. The existing authenticator has not been removed; try again.')
      setBusy(false)
      return
    }
    const verified = await supabase.auth.mfa.verify({
      factorId: enrollment.id,
      challengeId: challenge.data.id,
      code,
    })
    if (verified.error) {
      setError('That code was not accepted. Check the owner’s authenticator and try again. The existing factor remains enrolled.')
      setBusy(false)
      return
    }
    await supabase.auth.refreshSession()
    setEnrollment(null)
    setCode('')
    try {
      await reloadFactors()
      setMessage('The owner’s authenticator is now verified. Test a fresh sign-in with the owner’s phone before removing the previous factor.')
    } catch {
      setError('The new factor was verified, but the factor list could not refresh. Reload the page to confirm its status.')
    }
    setBusy(false)
    router.refresh()
  }

  async function removeOldFactor(factor: TotpFactor) {
    const verified = factors.filter((item) => item.status === 'verified')
    if (verified.length < 2) {
      setError('For safety, Zorah will not remove the last verified authenticator factor.')
      return
    }
    if (!window.confirm('Remove this authenticator from the account? Do this only after the owner has verified their own phone and confirmed it works. This cannot be undone.')) return
    setBusy(true); setError(''); setMessage('')
    const { error: removeError } = await supabase.auth.mfa.unenroll({ factorId: factor.id })
    if (removeError) {
      setError('Could not remove that factor. No other factor was changed.')
      setBusy(false)
      return
    }
    await supabase.auth.refreshSession()
    try {
      await reloadFactors()
      setMessage('The selected authenticator was removed. Confirm that the owner’s authenticator is the remaining verified factor before signing out.')
    } catch {
      setError('The factor was removed, but the list could not refresh. Reload this page and verify the remaining factor before signing out.')
    }
    setBusy(false)
    router.refresh()
  }

  const verifiedCount = factors.filter((factor) => factor.status === 'verified').length

  return (
    <main className="min-h-screen bg-[#f7f5f1] px-5 py-10 text-[#171a18] sm:px-8">
      <section className="mx-auto max-w-3xl">
        <a href="/admin/security" className="text-xs uppercase tracking-[.15em] text-black/55">← Back to Security</a>
        <p className="mt-8 text-[10px] font-semibold uppercase tracking-[.2em] text-black/50">Zorah Commerce Studio / Account security</p>
        <h1 className="mt-3 font-serif text-4xl">Authenticator management</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-black/65">Enroll the owner’s own authenticator before removing the existing one. This page never displays an existing authenticator secret.</p>

        <div className="mt-6 rounded-2xl border border-amber-700/20 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <strong>Important:</strong> Keep the current verified factor until the owner has scanned a new QR code, verified it, and successfully tested a fresh login. Never send the QR code, manual setup key, or six-digit code to anyone.
        </div>

        {error && <div role="alert" className="mt-5 rounded-xl border border-red-700/20 bg-red-50 p-4 text-sm text-red-900">{error}</div>}
        {message && <div role="status" className="mt-5 rounded-xl border border-emerald-700/20 bg-emerald-50 p-4 text-sm text-emerald-950">{message}</div>}

        <section className="mt-6 rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
          <h2 className="text-xl font-semibold">Registered authenticators</h2>
          {loading ? <p className="mt-4 text-sm text-black/55">Loading factors…</p> : factors.length === 0 ? <p className="mt-4 text-sm text-black/55">No authenticator factors are registered.</p> : (
            <ul className="mt-4 divide-y divide-black/10">
              {factors.map((factor) => (
                <li key={factor.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{factor.friendly_name || 'Authenticator app'}</p>
                    <p className="mt-1 text-xs text-black/55">Status: {factor.status}{factor.created_at ? ` · Added ${new Date(factor.created_at).toLocaleDateString()}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {factor.status === 'verified' && <span className="text-xs font-semibold text-emerald-800">Verified</span>}
                    {factor.status === 'verified' && verifiedCount > 1 && <button type="button" disabled={busy} onClick={() => void removeOldFactor(factor)} className="rounded-lg border border-red-700/20 px-3 py-2 text-xs text-red-800 disabled:opacity-40">Remove factor</button>}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!enrollment && <button type="button" disabled={busy || loading} onClick={() => void startEnrollment()} className="mt-5 rounded-xl bg-[#173d32] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">{busy ? 'Please wait…' : 'Add owner authenticator'}</button>}
        </section>

        {enrollment && <section className="mt-6 rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
          <h2 className="text-xl font-semibold">Scan with the owner’s phone</h2>
          <p className="mt-2 text-sm leading-6 text-black/60">Open the authenticator app on the owner’s phone and scan this QR code. Keep this screen private.</p>
          <div className="mt-5 inline-block rounded-xl bg-white p-3">
            <img src={enrollment.qrCode.startsWith('data:') ? enrollment.qrCode : `data:image/svg+xml;utf8,${encodeURIComponent(enrollment.qrCode)}`} alt="New owner authenticator QR code" className="h-56 w-56" />
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium">QR code not working? Show manual setup key</summary>
            <code className="mt-3 block break-all rounded-lg bg-black/5 p-3 text-xs">{enrollment.secret}</code>
          </details>
          <label htmlFor="owner-mfa-code" className="mt-5 block text-xs font-semibold">Six-digit code from the owner’s phone</label>
          <input id="owner-mfa-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\\D/g, '').slice(0, 6))} className="mt-2 w-full max-w-sm rounded-xl border border-black/15 px-4 py-3 text-center text-2xl tracking-[.35em]" placeholder="000000" />
          <button type="button" disabled={busy || code.length !== 6} onClick={() => void verifyEnrollment()} className="mt-4 block rounded-xl bg-[#173d32] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">{busy ? 'Verifying…' : 'Verify owner authenticator'}</button>
          <button type="button" disabled={busy} onClick={() => { setEnrollment(null); setCode(''); setError(''); setMessage('Enrollment cancelled. Existing authenticators were not removed.') }} className="mt-4 text-sm text-black/55 underline">Cancel setup</button>
        </section>}
      </section>
    </main>
  )
}
