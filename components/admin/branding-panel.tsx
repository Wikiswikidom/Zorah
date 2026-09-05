'use client'

import { useEffect, useState } from 'react'

type Branding = { media_path: string | null; media_url: string | null }
const ACCEPT = 'image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon'
const MAX = 5 * 1024 * 1024

export default function BrandingPanel() {
  const [settings, setSettings] = useState<Record<string, Branding>>({})
  const [files, setFiles] = useState<Record<string, File | null>>({})
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const r = await fetch('/api/admin/branding', { cache: 'no-store' })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(d.error || 'Unable to load brand settings.')
      setSettings(d.settings || {})
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load brand settings.') }
    finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])

  const choose = (key: string, file: File | null) => {
    if (!file) return
    if (file.size > MAX) return setError('Brand artwork must be 5 MiB or smaller.')
    const allowed = ['image/png','image/jpeg','image/webp','image/svg+xml','image/x-icon','image/vnd.microsoft.icon']
    if (!allowed.includes(file.type)) return setError('Use PNG, JPG, WebP, SVG or ICO.')
    setFiles(current => ({ ...current, [key]: file }))
    setPreviews(current => ({ ...current, [key]: URL.createObjectURL(file) }))
    setError(''); setMessage('')
  }

  const save = async (key: string) => {
    const file = files[key]
    if (!file || saving) return
    setSaving(key); setError(''); setMessage('')
    try {
      const form = new FormData(); form.append('file', file)
      const upload = await fetch('/api/admin/content/media', { method: 'POST', body: form })
      const uploaded = await upload.json().catch(() => ({}))
      if (!upload.ok) throw new Error(uploaded.error || 'Image upload failed.')
      const response = await fetch('/api/admin/branding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, media_path: uploaded.path }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Could not save brand artwork.')
      setSettings(current => ({ ...current, [key]: { media_path: data.media_path, media_url: data.media_url } }))
      setFiles(current => ({ ...current, [key]: null })); setPreviews(current => ({ ...current, [key]: '' }))
      setMessage(key === 'site_logo' ? 'Logo updated successfully.' : 'Favicon updated successfully.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save brand artwork.') }
    finally { setSaving(null) }
  }

  const remove = async (key: string) => {
    if (saving || !confirm(`Remove the current ${key === 'site_logo' ? 'logo' : 'favicon'}?`)) return
    setSaving(key); setError(''); setMessage('')
    try {
      const r = await fetch(`/api/admin/branding?key=${encodeURIComponent(key)}`, { method: 'DELETE' })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(d.error || 'Could not remove brand artwork.')
      setSettings(current => ({ ...current, [key]: { media_path: null, media_url: null } }))
      setMessage(key === 'site_logo' ? 'Logo removed.' : 'Favicon removed.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not remove brand artwork.') }
    finally { setSaving(null) }
  }

  const card = (key: 'site_logo' | 'site_favicon', title: string, description: string) => {
    const current = settings[key]
    const image = previews[key] || current?.media_url || ''
    return <article className="zorah-brand-card">
      <div className="zorah-brand-card-copy"><div><span>Brand asset</span><h3>{title}</h3><p>{description}</p></div><div className="zorah-brand-preview">{image ? <img src={image} alt={`${title} preview`} /> : <strong>{key === 'site_logo' ? 'Z' : 'Z'}</strong>}</div></div>
      <div className="zorah-brand-actions"><label className="zorah-brand-file">Choose image<input type="file" accept={ACCEPT} onChange={e => choose(key, e.target.files?.[0] || null)} /></label><button type="button" onClick={() => void save(key)} disabled={!files[key] || saving !== null}>{saving === key ? 'Uploading…' : `Save ${key === 'site_logo' ? 'logo' : 'favicon'}`}</button>{current?.media_path && <button type="button" className="danger" onClick={() => void remove(key)} disabled={saving !== null}>Remove</button>}</div>
      <small>{files[key]?.name || (current?.media_path ? 'Currently active' : 'No asset selected')}</small>
    </article>
  }

  return <section className="zorah-branding-panel">
    <div className="zorah-branding-head"><div><span>Site identity</span><h2>Logo & favicon</h2><p>Change the Zorah logo and browser icon without changing code. Updates are applied to the customer site.</p></div><button type="button" onClick={() => void load()} disabled={loading || saving !== null}>Refresh</button></div>
    {error && <div className="zorah-cms-alert is-error">{error}</div>}
    {message && <div className="zorah-cms-alert">{message}</div>}
    {loading ? <div className="zorah-cms-empty">Loading brand assets…</div> : <div className="zorah-brand-grid">{card('site_logo','Website logo','Use a transparent PNG, WebP or SVG for the cleanest result.')} {card('site_favicon','Favicon','Use a square PNG, WebP or ICO. A simple Zorah mark works best at small sizes.')}</div>}
  </section>
}
