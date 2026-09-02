'use client'

import { useState } from 'react'

export default function ProcessSchedulerButton() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function processNow() {
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/scheduling/process', { method: 'POST' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to process scheduled content')
      setMessage(`${payload.processed ?? 0} queued job(s) processed.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to process scheduled content')
    } finally {
      setBusy(false)
    }
  }

  return <div className="flex flex-col items-end gap-2"><button type="button" onClick={processNow} disabled={busy} className="rounded-full bg-[#111111] px-5 py-3 text-xs font-semibold uppercase tracking-[.16em] text-[#F7F3EC] transition hover:bg-[#173D32] disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Processing…' : 'Process now'}</button>{message && <p role="status" className="text-xs text-black/55">{message}</p>}</div>
}
