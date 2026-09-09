'use client'

import { FormEvent, useState } from 'react'
import { LoadingSpinner } from '@/components/loading-spinner'

export default function ContactForm() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    setSuccess(false)
    const form = event.currentTarget
    const payload = Object.fromEntries(new FormData(form).entries())
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'We could not send your message. Please try again.')
      form.reset()
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not send your message. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (success) {
    return (
      <div className="zorah-contact-success" role="status" aria-live="polite">
        <span className="zorah-contact-success-mark">✓</span>
        <p className="zorah-contact-kicker">Message received</p>
        <h3>Thank you for reaching out.</h3>
        <p>Our team will review your message and get back to you using the contact details you provided.</p>
        <button type="button" onClick={() => setSuccess(false)}>Send another message →</button>
      </div>
    )
  }

  return (
    <form className="zorah-contact-form" onSubmit={submit} noValidate>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="zorah-honeypot" />
      <div className="zorah-contact-fields">
        <label><span>Your name</span><input name="name" autoComplete="name" maxLength={160} required placeholder="Full name" /></label>
        <label><span>Email address</span><input name="email" type="email" autoComplete="email" maxLength={320} required placeholder="you@example.com" /></label>
        <label><span>Phone <em>Optional</em></span><input name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder="+234 …" /></label>
        <label><span>Subject <em>Optional</em></span><input name="subject" maxLength={160} placeholder="How can we help?" /></label>
        <label className="full"><span>Message</span><textarea name="message" maxLength={5000} required placeholder="Tell us what you would like to know…" /></label>
      </div>
      {error && <p className="zorah-contact-error" role="alert">{error}</p>}
      <div className="zorah-contact-form-foot">
        <p>We use your details only to respond to your enquiry and provide customer support.</p>
        <button disabled={busy} type="submit">{busy ? <><LoadingSpinner label="Sending message" size={16} /> Sending…</> : <>Send enquiry <span>→</span></>}</button>
      </div>
    </form>
  )
}
