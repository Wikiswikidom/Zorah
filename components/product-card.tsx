"use client";
import { useCommerce } from "@/components/commerce-provider";
type ProductCardProps = { slug?: string; name: string; price: string; tone: "ivory" | "brown" | "green" | "black" };
const tones = { ivory:"#e6ded2", brown:"#6b4632", green:"#23483b", black:"#242424" };
export function ProductCard({ slug, name, price, tone }: ProductCardProps) {
  const { isWishlisted, toggleWishlist } = useCommerce(); const saved = slug ? isWishlisted(slug) : false;
  return <article className="product-card"><div className="product-media-wrap"><a href={slug ? `/products/${slug}` : "/shop"} aria-label={`View ${name}`}><div className="product-media"><div className="product-placeholder" style={{ background:`linear-gradient(145deg, ${tones[tone]}, #f7f3ec22)` }} aria-hidden="true">Z</div></div></a>{slug && <button className={`wishlist-button ${saved ? "is-saved" : ""}`} onClick={() => toggleWishlist(slug)} aria-label={saved ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`} aria-pressed={saved}>{saved ? "♥" : "♡"}</button>}</div><a href={slug ? `/products/${slug}` : "/shop"} className="product-info"><p className="product-name">{name}</p><p className="product-price">{price}</p></a></article>;
}
