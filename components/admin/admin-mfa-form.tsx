'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'loading' | 'enroll' | 'verify'

function readableMfaError(error: { code?: string; message?: string } | null | undefined) {
  const code = error?.code || ''
  const message = (error?.message || '').toLowerCase()

  if (code === 'mfa_factor_exists' || message.includes('already exists')) {
    return 'A previous authenticator setup is still pending. We cleared the stale setup path; please reload and try again.'
  }
  if (message.includes('not enabled') || message.includes('disabled')) {
    return 'Authenticator security is not enabled in the Supabase project. Please enable TOTP MFA in Supabase Authentication settings.'
  }
  if (message.includes('rate limit') || error?.code === 'over_request_rate_limit') {
    return 'Too many security attempts were made. Wait a moment and try again.'
  }
  return 'We could not start authenticator setup. Please reload this page and try again.'
}

export function AdminMfaForm({ nextPath, email }: { nextPath: string; email: string }) {
  const router = useRouter()
  const supabase = createClient()
  const startedRef = useRef(false)
  const [mode, setMode] = useState<Mode>('loading')
  const [factorId, setFactorId] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    if (startedRef.current) return () => { active = false }
    startedRef.current = true

    async function prepare() {
      setError('')

      const factors = await supabase.auth.mfa.listFactors()
      if (!active) return
      if (factors.error) {
        setError(readableMfaError(factors.error))
        return
      }

      const verified = factors.data.totp.find((factor) => factor.status === 'verified')
      if (verified) {
        setFactorId(verified.id)
        setMode('verify')
        return
      }

      // A previous interrupted enrollment creates an unverified factor. Clear it
      // before starting a fresh enrollment so repeated visits cannot accumulate
      // stale factors or hit Supabase's unverified-factor limit.
      const pending = factors.data.totp.filter((factor) => factor.status !== 'verified')
      for (const factor of pending) {
        const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: factor.id })
        if (unenrollError) {
          if (!active) return
          setError(readableMfaError(unenrollError))
          return
        }
      }

      const enrollment = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'Zorah Commerce Studio',
        friendlyName: 'Zorah Commerce Studio',
      })
      if (!active) return
      if (enrollment.error || !enrollment.data) {
        setError(readableMfaError(enrollment.error))
        return
      }

      setFactorId(enrollment.data.id)
      setQrCode(enrollment.data.totp?.qr_code || '')
      setSecret(enrollment.data.totp?.secret || '')
      setMode('enroll')
    }

    void prepare()
    return () => { active = false }
  }, [email, supabase])

  async function verify() {
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code from your authenticator app.')
      return
    }

    setBusy(true)
    setError('')

    const challenge = await supabase.auth.mfa.challenge({ factorId })
    if (challenge.error || !challenge.data?.id) {
      setError('We could not start the authenticator verification challenge. Please try again.')
      setBusy(false)
      return
    }

    const result = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code,
    })

    if (result.error) {
      setError('That code could not be verified. Check your authenticator and try again.')
      setBusy(false)
      return
    }

    await supabase.auth.refreshSession()
    router.replace(nextPath)
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-[#101513] px-5 py-12 text-white sm:px-8">
      <section className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/[.05] p-7 shadow-2xl sm:p-9">
        <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-white/50">Zorah Commerce Studio</p>
        <h1 className="mt-3 font-serif text-4xl">Verify your identity.</h1>
        <p className="mt-3 text-sm leading-6 text-white/60">
          {mode === 'enroll'
            ? 'Set up an authenticator app before entering the private workspace.'
            : 'Enter the current code from your authenticator app.'}
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {mode === 'loading' && (
          <div className="mt-8 text-sm text-white/50">Checking security requirements…</div>
        )}

        {mode === 'enroll' && (
          <div className="mt-7 space-y-5">
            <div className="rounded-2xl bg-white p-4">
              {qrCode ? (
                <img
                  src={qrCode.startsWith('data:') ? qrCode : `data:image/svg+xml;utf8,${encodeURIComponent(qrCode)}`}
                  alt="Authenticator setup QR code"
                  className="mx-auto h-56 w-56"
                />
              ) : (
                <div className="h-56" />
              )}
            </div>
            <p className="text-xs leading-5 text-white/55">
              Scan this code with Google Authenticator, Microsoft Authenticator, 1Password, or another TOTP app.
            </p>
            {secret && (
              <div>
                <label className="text-[9px] uppercase tracking-[.15em] text-white/40">Manual setup key</label>
                <code className="mt-2 block break-all rounded-xl bg-black/30 p-3 text-xs text-white/80">{secret}</code>
              </div>
            )}
          </div>
        )}

        {(mode === 'enroll' || mode === 'verify') && (
          <div className="mt-7">
            <label htmlFor="admin-mfa-code" className="text-[10px] font-semibold uppercase tracking-[.15em] text-white/50">
              6-digit code
            </label>
            <input
              id="admin-mfa-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-center text-2xl tracking-[.35em] outline-none focus:border-white/40"
              placeholder="000000"
            />
            <button
              type="button"
              disabled={busy || code.length !== 6}
              onClick={verify}
              className="mt-4 w-full rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? 'Verifying…' : mode === 'enroll' ? 'Enable secure access' : 'Continue to Commerce Studio'}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => supabase.auth.signOut().then(() => router.replace('/admin-login'))}
          className="mt-5 w-full text-xs text-white/45 hover:text-white"
        >
          Cancel and sign out
        </button>
      </section>
    </main>
  )
}
