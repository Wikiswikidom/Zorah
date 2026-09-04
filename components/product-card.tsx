"use client";
import { useCommerce } from "@/components/commerce-provider";
import type { Product } from "@/lib/catalog";

type ProductCardProps={slug?:string;name:string;price:string;priceValue?:number;tone?:"ivory"|"brown"|"green"|"black";imageUrl?:string|null;badge?:string|null;category?:string;availability?:string;colors?:string[]};
export function ProductCard({slug,name,price,priceValue=0,tone="ivory",imageUrl,badge,category,availability,colors=[]}:ProductCardProps){
 const{isWishlisted,toggleWishlist,addToBag}=useCommerce();const saved=slug?isWishlisted(slug):false;
 const product:Product={slug:slug||"",name,price,priceValue,category:category||"Handbags",tone,colors,availability:(availability==="In stock"?"In stock":"Made to order"),featuredRank:0,description:`${name}, crafted by Zorah in Lagos.`,details:["Leather exterior","Considered interior","Hand-finished hardware","Crafted in Lagos"],variants:colors.length?colors:["Default"],imageUrl};
 return <article className="product-card">
  <div className="product-media-wrap"><a href={slug?`/products/${slug}`:"/shop"} aria-label={`View ${name}`}><div className="product-media">{imageUrl?<img src={imageUrl} alt={name} loading="lazy" className="h-full w-full object-cover"/>:<div className="product-placeholder" aria-hidden="true">Z</div>}{badge&&<span className="product-badge">{badge}</span>}</div></a>{slug&&<button type="button" className={`wishlist-button ${saved?"is-saved":""}`} onClick={()=>toggleWishlist(slug)} aria-label={saved?`Remove ${name} from wishlist`:`Save ${name} to wishlist`} aria-pressed={saved}>{saved?"♥":"♡"}</button>}</div>
  <div className="product-info"><a href={slug?`/products/${slug}`:"/shop"} className="product-copy"><p className="product-name">{name}</p>{category&&<p className="product-category">{category}</p>}<p className="product-price">{price}</p>{availability&&<p className="product-availability">{availability}</p>}</a>{slug&&<button type="button" className="product-add" onClick={()=>addToBag(product)} aria-label={`Add ${name} to bag`}>Add to bag</button>}</div>
 </article>
}
