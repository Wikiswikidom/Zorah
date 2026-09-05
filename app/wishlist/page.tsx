import Link from 'next/link'
import {StorefrontHeader} from '@/components/storefront-header'
import {WishlistContent} from '@/components/wishlist-content'
import {createClient} from '@/lib/supabase/server'

export default async function WishlistPage(){
 const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();
 if(!user)return <main className="jumia-market-page"><StorefrontHeader/><div className="jumia-market-wrap"><div className="jumia-breadcrumb"><Link href="/shop">Home</Link><span>›</span> Wishlist</div><div className="jumia-page-title-row"><h1>Wishlist</h1><span>Save your favourite Zorah bags</span></div><div className="jumia-empty-card"><div className="jumia-empty-icon">♡</div><h2>Sign in to use your wishlist</h2><p>Your saved pieces stay connected to your Zorah account.</p><Link className="jumia-primary-btn" href="/login?next=/wishlist">Login / Sign up</Link></div></div></main>
 const{count}=await supabase.from('customer_wishlists').select('product_id',{count:'exact',head:true}).eq('user_id',user.id);
 return <main className="jumia-market-page"><StorefrontHeader/><div className="jumia-market-wrap"><div className="jumia-breadcrumb"><Link href="/shop">Home</Link><span>›</span> Wishlist</div><div className="jumia-page-title-row"><h1>Wishlist</h1><span>{count??0} saved item{count===1?'':'s'}</span></div><WishlistContent/></div></main>
}
