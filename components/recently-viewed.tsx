"use client";
import { useCommerce } from "@/components/commerce-provider";
import { products } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
export function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) { const { recentlyViewed }=useCommerce(); const items=recentlyViewed.map(slug=>products.find(p=>p.slug===slug)).filter(Boolean).filter(p=>p!.slug!==excludeSlug).slice(0,4); if(!items.length)return null; return <section className="section recently-viewed"><div className="section-head"><div><p className="eyebrow">From your browsing</p><h2 className="section-title">Recently viewed.</h2></div></div><div className="product-grid">{items.map(p=><ProductCard key={p!.slug} {...p!}/>)}</div></section>; }
