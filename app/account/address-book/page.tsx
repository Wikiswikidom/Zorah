import Link from 'next/link'
import { AccountSubpage } from '@/components/account-subpage'

export default function AddressBookPage(){return <AccountSubpage title="Address Book" description="Keep your delivery details ready so checkout stays quick and simple." icon="⌖"><div className="jumia-info-card"><div><span>Saved delivery address</span><strong>Manage your address from checkout</strong></div><div><span>How it works</span><strong>Your latest saved delivery information is reused automatically</strong></div></div><div className="jumia-subpage-actions"><Link className="jumia-primary-btn" href="/checkout">Manage delivery information</Link><Link href="/account">Back to My Account</Link></div></AccountSubpage>}
