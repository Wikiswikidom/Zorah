'use client'

import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/loading-spinner'

export default function LegalPageEditor(){
  const [title,setTitle]=useState('')
  const [body,setBody]=useState('')
  const [version,setVersion]=useState('1.0')
  const [published,setPublished]=useState(true)
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')

  const load=async()=>{
    setLoading(true);setError('')
    try{
      const r=await fetch('/api/admin/legal/terms-and-conditions',{cache:'no-store'})
      const d=await r.json().catch(()=>({}))
      if(!r.ok)throw new Error(d.error||'Could not load Terms & Conditions.')
      setTitle(d.page?.title||'Terms & Conditions');setBody(d.page?.body||'');setVersion(d.page?.version||'1.0');setPublished(d.page?.is_published!==false)
    }catch(e){setError(e instanceof Error?e.message:'Could not load Terms & Conditions.')}finally{setLoading(false)}
  }
  useEffect(()=>{void load()},[])

  const save=async()=>{
    if(saving)return
    setSaving(true);setMessage('');setError('')
    try{
      const r=await fetch('/api/admin/legal/terms-and-conditions',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,body,version,is_published:published})})
      const d=await r.json().catch(()=>({}))
      if(!r.ok)throw new Error(d.error||'Could not save Terms & Conditions.')
      setMessage('Terms & Conditions saved and versioned successfully.')
    }catch(e){setError(e instanceof Error?e.message:'Could not save Terms & Conditions.')}finally{setSaving(false)}
  }

  if(loading)return <div className="zorah-cms-empty" aria-live="polite"><LoadingSpinner label="Loading Terms & Conditions"/></div>
  return <div className="zorah-cms-editor">
    <div className="zorah-cms-toolbar"><div><strong>Legal content</strong><span>Only Content Admins and Super Admins can change this page.</span></div><a href="/terms-and-conditions" target="_blank" rel="noreferrer">Preview terms ↗</a></div>
    {(error||message)&&<div className={`zorah-cms-alert ${error?'is-error':''}`} role={error?'alert':'status'}>{error||message}</div>}
    <div className="zorah-cms-grid">
      <section className="zorah-cms-form">
        <label>Page title<input value={title} maxLength={160} onChange={e=>setTitle(e.target.value)}/></label>
        <div className="zorah-cms-two"><label>Version<input value={version} maxLength={40} onChange={e=>setVersion(e.target.value)}/></label><label className="zorah-cms-check"><input type="checkbox" checked={published} onChange={e=>setPublished(e.target.checked)}/> Published for customers</label></div>
        <label>Terms & Conditions<textarea rows={24} value={body} maxLength={30000} onChange={e=>setBody(e.target.value)} placeholder="Write the current Zorah terms here. Separate sections with a blank line."/></label>
        <p className="zorah-content-form-note">Keep headings as the first line of each section, followed by the section text. The customer page renders the content as readable, safe text rather than executable HTML.</p>
        <button type="button" className="zorah-cms-save" disabled={saving||!title.trim()||!body.trim()} onClick={()=>void save()}>{saving?<><LoadingSpinner size={15} label="Saving"/> Saving…</>:'Save legal page'}</button>
      </section>
      <aside className="zorah-cms-list"><div className="zorah-cms-list-help"><strong>Publishing rule</strong><br/>Customers only see the published version. Saving a new version does not expose passwords, private admin data or internal notes.</div><div className="zorah-cms-list-help"><strong>Checkout consent</strong><br/>Customers must actively tick the Terms & Conditions checkbox before an order can be created.</div></aside>
    </div>
  </div>
}
