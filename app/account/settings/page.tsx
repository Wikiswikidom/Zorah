"use client"
import {useEffect,useState} from 'react'
import Link from 'next/link'
import {StorefrontHeader} from '@/components/storefront-header'

type Profile={full_name:string;phone:string}

export default function AccountSettingsPage(){
 const [profile,setProfile]=useState<Profile>({full_name:'',phone:''})
 const [email,setEmail]=useState('')
 const [loading,setLoading]=useState(true)
 const [busy,setBusy]=useState(false)
 const [message,setMessage]=useState('')
 const [error,setError]=useState('')
 useEffect(()=>{fetch('/api/customer/profile',{cache:'no-store'}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not load account');setProfile({full_name:d.profile?.full_name||'',phone:d.profile?.phone||''});setEmail(d.email||'')}).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[])
 const save=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError('');setMessage('');try{const r=await fetch('/api/customer/profile',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(profile)});const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not save account');setProfile(d.profile);setMessage('Your account details have been saved.')}catch(e){setError(e instanceof Error?e.message:'Could not save account')}finally{setBusy(false)}}
 return <main className="jumia-market-page"><StorefrontHeader/><div className="jumia-market-wrap"><div className="jumia-breadcrumb"><Link href="/">Home</Link><span>›</span><Link href="/account">My Account</Link><span>›</span>Account Management</div><section className="jumia-subpage-content"><div className="jumia-subpage-head"><div className="jumia-subpage-icon">○</div><div><h1>Account Management</h1><p>Update your personal details once and keep checkout simple.</p></div></div>{loading?<div className="jumia-loading">Loading your account…</div>:<form className="jumia-settings-form" onSubmit={save}><label>Full name<input name="full_name" autoComplete="name" value={profile.full_name} onChange={e=>setProfile({...profile,full_name:e.target.value})} placeholder="Your full name" required/></label><label>Email<input name="email" type="email" value={email} readOnly aria-readonly placeholder="Your account email"/></label><label>Phone number<input name="phone" autoComplete="tel" value={profile.phone} onChange={e=>setProfile({...profile,phone:e.target.value})} placeholder="Your phone number"/></label><button className="jumia-primary-btn" type="submit" disabled={busy}>{busy?'Saving…':'Save Changes'}</button>{message&&<p className="jumia-success" role="status">{message}</p>}{error&&<p className="jumia-form-error" role="alert">{error}</p>}</form>}<div className="jumia-subpage-actions"><Link href="/account">Back to My Account</Link></div></section></div></main>
}
