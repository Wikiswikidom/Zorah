import Link from 'next/link'
import { StorefrontHeader } from '@/components/storefront-header'
import { WaitlistContent } from '@/components/waitlist-content'

export default function WaitlistPage(){
  return <main className="jumia-market-page"><StorefrontHeader/><div className="jumia-market-wrap"><div className="jumia-breadcrumb"><Link href="/shop">Home</Link><span>›</span><Link href="/account">My Account</Link><span>›</span>Waitlist</div><div className="jumia-page-title-row"><h1>Waitlist</h1><span>Pieces you want to hear about</span></div><WaitlistContent/></div></main>
}
