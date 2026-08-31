import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/catalog";
export function RelatedProducts({currentSlug}:{currentSlug:string}){const related=products.filter(p=>p.slug!==currentSlug).slice(0,3);return related.length?<section className="section related-section"><div className="section-head"><div><p className="eyebrow">Complete the edit</p><h2 className="section-title">You may also like.</h2></div></div><div className="product-grid">{related.map(p=><ProductCard key={p.slug} {...p}/>)}</div></section>:null;}
