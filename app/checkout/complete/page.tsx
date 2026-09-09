'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
import {StorefrontHeader} from '@/components/storefront-header'

export default function CheckoutComplete(){
 const[status,setStatus]=useState<'checking'|'paid'|'pending'|'failed'>('checking');const[reference,setReference]=useState('')
 useEffect(()=>{
  const ref=new URLSearchParams(window.location.search).get('reference')||new URLSearchParams(window.location.search).get('trxref')||'';setReference(ref)
  if(!ref){setStatus('failed');return}
  let attempts=0,stopped=false
  const check=async()=>{try{const r=await fetch(`/api/checkout/verify?reference=${encodeURIComponent(ref)}`,{cache:'no-store'});const d=await r.json().catch(()=>({}));if(stopped)return;if(r.ok&&d.paid){setStatus('paid');return}if(d.status==='failed'||d.status==='abandoned'||d.status==='reversed'){setStatus('failed');return}attempts+=1;if(attempts<6)window.setTimeout(check,3000);else setStatus('pending')}catch{if(!stopped){attempts+=1;if(attempts<6)window.setTimeout(check,3000);else setStatus('pending')}}}
  void check();return()=>{stopped=true}
 },[])
 return <><StorefrontHeader/><main className="page-shell"><div className="empty-state">
  {status==='checking'&&<><h1>Confirming payment…</h1><p>We are securely checking your transaction. Please do not close this page.</p></>}
  {status==='paid'&&<><h1>Thank you for your order.</h1><p>Your payment has been confirmed. Your order is now being prepared.</p>{reference&&<p><strong>Payment reference:</strong> {reference}</p>}<Link className="button button-dark" href="/account/orders">View my orders</Link></>}
  {status==='pending'&&<><h1>Payment is being confirmed.</h1><p>Your transaction has not reached a final status yet. You can safely check your order again from your account.</p>{reference&&<p><strong>Payment reference:</strong> {reference}</p>}<div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}><Link className="button button-dark" href="/account/orders">View my orders</Link><Link className="button" href="/shop">Continue shopping</Link></div></>}
  {status==='failed'&&<><h1>Payment was not completed.</h1><p>No paid order was confirmed. Return to your bag and try again.</p><Link className="button button-dark" href="/cart">Back to bag</Link></>}
 </div></main></>
}
