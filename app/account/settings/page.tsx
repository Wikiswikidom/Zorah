"use client"
import {useState} from 'react'
import Link from 'next/link'
import {StorefrontHeader} from '@/components/storefront-header'

export default function AccountSettingsPage(){
 const [saved,setSaved]=useState(false)
 return <main className="jumia-market-page"><StorefrontHeader/><div className="jumia-market-wrap"><div className="jumia-breadcrumb"><Link href="/">Home</Link><span>›</span><Link href="/account">My Account</Link><span>›</span>Account Management</div><section className="jumia-subpage-content"><div className="jumia-subpage-head"><div className="jumia-subpage-icon">○</div><div><h1>Account Management</h1><p>Keep your Zorah account details up to date.</p></div></div><form className="jumia-settings-form" onSubmit={e=>{e.preventDefault();setSaved(true)}}><label>Full name<input name="full_name" autoComplete="name" placeholder="Your full name"/></label><label>Email<input name="email" type="email" autoComplete="email" placeholder="Your email"/></label><label>Phone number<input name="phone" autoComplete="tel" placeholder="Your phone number"/></label><button className="jumia-primary-btn" type="submit">Save Changes</button>{saved&&<p className="jumia-success" role="status">Details saved on this device. Your account profile can be connected to persistent profile editing next.</p>}</form><div className="jumia-subpage-actions"><Link href="/account">Back to My Account</Link></div></section></div></main>
}
