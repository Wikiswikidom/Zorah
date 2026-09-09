"use client";
import { useCommerce } from "@/components/commerce-provider";
import type { Product } from "@/lib/catalog";

type ProductCardProps={slug?:string;name:string;price:string;priceValue?:number;tone?:"ivory"|"brown"|"green"|"black";imageUrl?:string|null;badge?:string|null;category?:string;availability?:string;colors?:string[];variantDetails?:Product["variantDetails"]};
export function ProductCard({slug,name,price,priceValue=0,tone="ivory",imageUrl,badge,category,availability,colors=[],variantDetails=[]}:ProductCardProps){
 const{isWishlisted,toggleWishlist,addToBag}=useCommerce();const saved=slug?isWishlisted(slug):false;
 const normalizedAvailability=availability==='Unavailable'?'Unavailable':availability==='In stock'?'In stock':'Made to order';
 const product:Product={slug:slug||"",name,price,priceValue,category:category||"Handbags",tone,colors,availability:normalizedAvailability,featuredRank:0,description:`${name}, crafted by Zorah in Lagos.`,details:["Leather exterior","Considered interior","Hand-finished hardware","Crafted in Lagos"],variants:colors.length?colors:["Default"],imageUrl,variantDetails};
 const defaultVariant=variantDetails?.find(v=>v.label&&v.isAvailable)?.label||variantDetails?.[0]?.label||colors[0]||"Default";
 const purchasable=variantDetails?.length?variantDetails.some(v=>v.isAvailable):true;
 return <article className="product-card">
  <div className="product-media-wrap"><a href={slug?`/products/${slug}`:"/shop"} aria-label={`View ${name}`}><div className="product-media">{imageUrl?<img src={imageUrl} alt={name} loading="lazy" className="h-full w-full object-cover"/>:<div className="product-placeholder" aria-hidden="true">Z</div>}{badge&&<span className="product-badge">{badge}</span>}</div></a>{slug&&<button type="button" className={`wishlist-button ${saved?"is-saved":""}`} onClick={()=>toggleWishlist(slug)} aria-label={saved?`Remove ${name} from wishlist`:`Save ${name} to wishlist`} aria-pressed={saved}>{saved?"♥":"♡"}</button>}</div>
  <div className="product-info"><a href={slug?`/products/${slug}`:"/shop"} className="product-copy"><p className="product-name">{name}</p>{category&&<p className="product-category">{category}</p>}<p className="product-price">{price}</p>{availability&&<p className="product-availability">{availability}</p>}</a>{slug&&<button type="button" className="product-add" disabled={!purchasable} onClick={()=>addToBag(product,1,defaultVariant)} aria-label={purchasable?`Add ${name} to bag`:`${name} is unavailable`}>{purchasable?'Add to bag':'Unavailable'}</button>}</div>
 </article>
}
