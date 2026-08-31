import type { Metadata } from 'next'
import { notFound } from "next/navigation";
import { getProduct, products } from "@/lib/catalog";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchase } from "@/components/product-purchase";
import { RelatedProducts } from "@/components/related-products";
import { RecentlyViewed } from "@/components/recently-viewed";
import { createClient } from "@/lib/supabase/server";

export function generateStaticParams(){return products.map(product=>({slug:product.slug}));}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params
 const supabase=await createClient()
 const {data}=await supabase.from('products').select('name,short_description,description,seo_title,seo_description,seo_keywords,status').eq('slug',slug).eq('status','published').maybeSingle()
 const fallback=getProduct(slug)
 const name=data?.name??fallback?.name??'Zorah Handbags'
 const description=(data?.seo_description||data?.short_description||data?.description||fallback?.description||'Handcrafted leather handbags by Zorah.').slice(0,170)
 const title=(data?.seo_title||`${name} | Zorah Handbags`).slice(0,70)
 if(!data&&!fallback)return {title:'Product not found | Zorah'}
 return {title,description,keywords:data?.seo_keywords??undefined,alternates:{canonical:`/products/${slug}`},openGraph:{title,description,type:'website'}}
}

export default async function ProductPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const product=getProduct(slug);if(!product)notFound();return <><main className="page-shell"><div className="product-detail"><ProductGallery product={product}/><div className="product-detail-info"><p className="eyebrow">{product.category}</p><h1 className="page-title">{product.name}</h1><p className="product-price">{product.price}</p><p className="page-lede">{product.description}</p><ProductPurchase product={product}/><div className="detail-list">{product.details.map(detail=><div key={detail}><span>—</span>{detail}</div>)}</div><details><summary>Dimensions & capacity</summary><p>Exact measurements and an in-scale image will be supplied with final product photography.</p></details><details><summary>Delivery & returns</summary><p>Delivery estimates, returns eligibility and care guidance will be surfaced here before checkout.</p></details><details><summary>Materials & care</summary><p>Leather-specific care instructions will be provided for each finished piece.</p></details></div></div></main><RelatedProducts currentSlug={product.slug}/><RecentlyViewed excludeSlug={product.slug}/></>;
}
