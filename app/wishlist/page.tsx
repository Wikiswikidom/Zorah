"use client"

import Link from 'next/link'
import { useMemo } from 'react'
import { StorefrontHeader } from '@/components/storefront-header'
import { useCommerce } from '@/components/commerce-provider'
import { products } from '@/lib/catalog'

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToBag } = useCommerce()
  const saved = useMemo(() => wishlist.map(slug => products.find(p => p.slug === slug)).filter(Boolean), [wishlist])

  return <main className="jumia-market-page">
    <StorefrontHeader />
    <div className="jumia-market-wrap">
      <div className="jumia-breadcrumb"><Link href="/">Home</Link><span>›</span> Wishlist</div>
      <div className="jumia-page-title-row"><h1>Wishlist</h1><span>{saved.length} saved item{saved.length===1?'':'s'}</span></div>
      {!saved.length ? <div className="jumia-empty-card"><div className="jumia-empty-icon">♡</div><h2>Your wishlist is empty</h2><p>Save a Zorah bag you love and come back to it anytime.</p><Link className="jumia-primary-btn" href="/shop">Start Shopping</Link></div> :
        <div className="jumia-product-grid">{saved.map(product => product && <article className="jumia-product-card" key={product.slug}>
          <Link href={`/products/${product.slug}`} className={`jumia-product-image tone-${product.tone}`}><span>Z</span></Link>
          <button className="jumia-heart" onClick={()=>toggleWishlist(product.slug)} aria-label={`Remove ${product.name} from wishlist`}>♥</button>
          <div className="jumia-product-body"><Link href={`/products/${product.slug}`}><h2>{product.name}</h2></Link><p>{product.category}</p><strong>{product.priceValue?`₦${product.priceValue.toLocaleString('en-NG')}`:'Price on request'}</strong><button className="jumia-card-btn" onClick={()=>addToBag(product)}>Add to Cart</button></div>
        </article>)}</div>}
    </div>
  </main>
}
