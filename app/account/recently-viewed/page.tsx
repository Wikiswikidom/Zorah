import Link from 'next/link'
import {createClient} from '@/lib/supabase/server'
import {StorefrontHeader} from '@/components/storefront-header'
import {RecentlyViewedContent} from '@/components/recently-viewed-content'

export default async function RecentlyViewedPage(){
 const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();
 if(!user)return <main className="jumia-market-page"><StorefrontHeader/><div className="jumia-market-wrap"><div className="jumia-breadcrumb"><Link href="/shop">Home</Link><span>›</span><Link href="/account">My Account</Link><span>›</span>Recently Viewed</div><div className="jumia-page-title-row"><h1>Recently Viewed</h1><span>Your browsing history</span></div><div className="jumia-empty-card"><div className="jumia-empty-icon">◷</div><h2>Sign in to see your history</h2><p>Your recently viewed bags are saved to your Zorah account.</p><Link className="jumia-primary-btn" href="/login?next=/account/recently-viewed">Login / Sign up</Link></div></div></main>
 const{count}=await supabase.from('customer_recently_viewed').select('product_id',{count:'exact',head:true}).eq('user_id',user.id);
 return <main className="jumia-market-page"><StorefrontHeader/><div className="jumia-market-wrap"><div className="jumia-breadcrumb"><Link href="/shop">Home</Link><span>›</span><Link href="/account">My Account</Link><span>›</span>Recently Viewed</div><div className="jumia-page-title-row"><h1>Recently Viewed</h1><span>{count??0} item{count===1?'':'s'}</span></div><RecentlyViewedContent/></div></main>
}
