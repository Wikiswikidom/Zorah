import Link from 'next/link'
import { StorefrontHeader } from '@/components/storefront-header'
import { WishlistContent } from '@/components/wishlist-content'

export default function WishlistPage(){
 return <main className="jumia-market-page"><StorefrontHeader/><div className="jumia-market-wrap"><div className="jumia-breadcrumb"><Link href="/shop">Home</Link><span>›</span> Wishlist</div><div className="jumia-page-title-row"><h1>Wishlist</h1><span>Save your favourite Zorah bags</span></div><WishlistContent/></div></main>
}
