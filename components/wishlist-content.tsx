"use client";
import { useCommerce } from "@/components/commerce-provider";
import { products } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
export function WishlistContent(){const {wishlist}=useCommerce();const items=wishlist.map(slug=>products.find(p=>p.slug===slug)).filter(Boolean);if(!items.length)return <div className="empty-state"><span className="empty-mark">♡</span><h2>Your wishlist is empty</h2><p>Save pieces you love while you explore.</p><a className="button button-dark" href="/shop">Explore the collection</a></div>;return <div className="product-grid">{items.map(p=><ProductCard key={p!.slug} {...p!}/>)}</div>;}
