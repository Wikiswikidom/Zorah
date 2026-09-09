'use client'

import { useState } from 'react'
import { LoadingSpinner } from '@/components/loading-spinner'

type LegalPage = {
  slug: string
  title: string
  body: string
  version: string
  is_published: boolean
  updated_at: string | null
}

export default function TermsEditor({ initialPage }: { initialPage: LegalPage }) {
  const [title, setTitle] = useState(initialPage.title)
  const [body, setBody] = useState(initialPage.body)
  const [version, setVersion] = useState(initialPage.version)
  const [published, setPublished] = useState(initialPage.is_published)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function save() {
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const response = await fetch('/api/admin/legal/terms-and-conditions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, version, is_published: published }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Could not save the terms.')
      setMessage('Terms saved successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the terms.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="zorah-dashboard-panel legal-editor-panel">
      <div className="legal-editor-top">
        <div>
          <span className="zorah-dashboard-kicker">Customer-facing document</span>
          <h2>Agreement editor</h2>
          <p>Use a clear heading for each section. Separate sections with a blank line so the customer page can build its navigation automatically.</p>
        </div>
        <div className={`legal-publish-state ${published ? 'is-live' : ''}`}>
          <span /> {published ? 'Published' : 'Draft'}
        </div>
      </div>

      <div className="legal-editor-form">
        <label>
          <span>Page title</span>
          <input value={title} onChange={e => setTitle(e.target.value)} maxLength={160} />
        </label>
        <label>
          <span>Version</span>
          <input value={version} onChange={e => setVersion(e.target.value)} maxLength={40} placeholder="1.0" />
        </label>
        <label className="legal-editor-full">
          <span>Terms content</span>
          <textarea value={body} onChange={e => setBody(e.target.value)} maxLength={30000} rows={24} placeholder="Welcome to Zorah..." />
          <small>Tip: start numbered sections with “1. Orders and payment”, “2. Customer information”, etc.</small>
        </label>
        <label className="legal-publish-toggle">
          <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
          <span><strong>Publish this version</strong><small>Only published terms are shown to customers.</small></span>
        </label>
      </div>

      {message && <p className="legal-editor-success">{message}</p>}
      {error && <p className="legal-editor-error">{error}</p>}

      <div className="legal-editor-actions">
        <button type="button" onClick={save} disabled={saving} className="zorah-primary-action">
          {saving ? <><LoadingSpinner size={14} label="Saving" /> Saving…</> : 'Save changes'}
        </button>
        <a href="/terms-and-conditions" target="_blank" rel="noreferrer" className="zorah-secondary-action">Preview customer page ↗</a>
      </div>
    </section>
  )
}
