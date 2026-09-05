"use client"
import Link from 'next/link'
import { useCommerce } from '@/components/commerce-provider'
import { products } from '@/lib/catalog'
import { StorefrontHeader } from '@/components/storefront-header'

export default function RecentlyViewedPage(){
 const {recentlyViewed}=useCommerce()
 const items=recentlyViewed.map(slug=>products.find(p=>p.slug===slug)).filter(Boolean)
 return <main className="jumia-market-page"><StorefrontHeader/><div className="jumia-market-wrap"><div className="jumia-breadcrumb"><Link href="/">Home</Link><span>›</span><Link href="/account">My Account</Link><span>›</span>Recently Viewed</div><div className="jumia-page-title-row"><h1>Recently Viewed</h1><span>{items.length} item{items.length===1?'':'s'}</span></div>{!items.length?<div className="jumia-empty-card"><div className="jumia-empty-icon">◷</div><h2>No recently viewed products</h2><p>Products you open will appear here for quick access.</p><Link className="jumia-primary-btn" href="/shop">Browse Products</Link></div>:<div className="jumia-product-grid">{items.map(product=>product&&<Link href={`/products/${product.slug}`} className="jumia-product-card" key={product.slug}><div className={`jumia-product-image tone-${product.tone}`}><span>Z</span></div><div className="jumia-product-body"><h2>{product.name}</h2><p>{product.category}</p><strong>{product.priceValue?`₦${product.priceValue.toLocaleString('en-NG')}`:'Price on request'}</strong></div></Link>)}</div>}</div></main>
}
