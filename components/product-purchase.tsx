"use client";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/catalog";
import { useCommerce } from "@/components/commerce-provider";
export function ProductPurchase({ product }: { product: Product }) {
  const { addToBag, trackViewed } = useCommerce(); const [variant,setVariant]=useState(product.variants[0]||"Default"); const [quantity,setQuantity]=useState(1); const [added,setAdded]=useState(false);
  useEffect(()=>trackViewed(product.slug),[product.slug,trackViewed]);
  const add=()=>{addToBag(product,quantity,variant);setAdded(true);window.setTimeout(()=>setAdded(false),1800)};
  return <div className="buy-panel"><div className="variant-picker"><span className="picker-label">Colour</span><div className="variant-options">{product.variants.map(option=><button key={option} className={variant===option?"variant-option is-selected":"variant-option"} onClick={()=>setVariant(option)} aria-pressed={variant===option}>{option}</button>)}</div></div><div className="purchase-row"><div className="quantity-control" aria-label="Quantity"><button onClick={()=>setQuantity(q=>Math.max(1,q-1))} aria-label="Decrease quantity">−</button><span>{quantity}</span><button onClick={()=>setQuantity(q=>q+1)} aria-label="Increase quantity">+</button></div><button className="button button-dark add-button" onClick={add}>{added?"Added to bag ✓":"Add to bag"}</button></div><a className="secondary-action" href="/cart">View bag →</a><a className="secondary-action" href="/custom-orders">Need something different? Custom order →</a></div>;
}
