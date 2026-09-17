"use client"
import Link from "next/link"
import { products } from "@/lib/catalog"
import { ProductCard } from "@/components/product-card"
import { useCommerce } from "@/components/commerce-provider"

export function WaitlistContent(){
  const { waitlist } = useCommerce()
  const items=waitlist.map(slug=>products.find(product=>product.slug===slug)).filter(Boolean)
  if(!items.length) return <div className="jumia-empty-card"><div className="jumia-empty-icon">◌</div><h2>Your waitlist is empty</h2><p>Save an unavailable piece and we’ll keep it here for you.</p><Link className="jumia-primary-btn" href="/shop">Continue Shopping</Link></div>
  return <div className="jumia-product-grid">{items.map(product=><ProductCard key={product!.slug} {...product!}/>)}</div>
}
