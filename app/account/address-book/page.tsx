import Link from 'next/link'
import { AccountSubpage } from '@/components/account-subpage'
import { createClient } from '@/lib/supabase/server'

export default async function AddressBookPage(){
 const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();
 const{data:addresses,error}=await supabase.from('customer_addresses').select('id,label,full_name,phone,address_line1,address_line2,city,state,country,is_default').eq('user_id',user!.id).order('is_default',{ascending:false}).order('created_at',{ascending:false});
 if(error)console.error('address book load failed',error)
 return <AccountSubpage title="Address Book" description="Keep your delivery details ready so checkout stays quick and simple." icon="⌖">
  {!addresses?.length?<div className="jumia-empty-card"><div className="jumia-empty-icon">⌖</div><h2>No saved addresses</h2><p>Add your delivery information during checkout and it will be available here.</p><Link className="jumia-primary-btn" href="/checkout">Add Delivery Address</Link></div>:<div className="jumia-address-list">{addresses.map(address=><article className="jumia-address-card" key={address.id}><div className="jumia-address-top"><strong>{address.label||'Delivery address'}</strong>{address.is_default&&<span>Default</span>}</div><p><b>{address.full_name}</b><br/>{address.address_line1}{address.address_line2&&<><br/>{address.address_line2}</>}<br/>{address.city}, {address.state}{address.country&&`, ${address.country}`}</p>{address.phone&&<small>{address.phone}</small>}</article>)}</div>}
  <div className="jumia-subpage-actions"><Link className="jumia-primary-btn" href="/checkout">Manage delivery information</Link><Link href="/account">Back to My Account</Link></div>
 </AccountSubpage>
}
