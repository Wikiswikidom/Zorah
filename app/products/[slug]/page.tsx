import { notFound } from "next/navigation";
import { getProduct, products } from "@/lib/catalog";

export function generateStaticParams() { return products.map((product) => ({ slug: product.slug })); }

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  return <main className="page-shell"><div className="product-detail"><div className={`product-gallery tone-${product.tone}`}><div className="gallery-main"><span>Product photography</span></div><div className="gallery-thumbs"><span /><span /><span /></div></div><div className="product-info"><p className="eyebrow">{product.category}</p><h1 className="page-title">{product.name}</h1><p className="product-price">{product.price}</p><p className="page-lede">{product.description}</p><div className="buy-panel"><button className="button button-dark">Add to bag</button><a className="secondary-action" href="/custom-orders">Need something different? Custom order →</a></div><div className="detail-list">{product.details.map((detail) => <div key={detail}><span>—</span>{detail}</div>)}</div><details><summary>Dimensions & capacity</summary><p>Exact measurements and an in-scale image will be supplied with final product photography.</p></details><details><summary>Delivery & returns</summary><p>Delivery estimates, returns eligibility and care guidance will be surfaced here before checkout.</p></details><details><summary>Materials & care</summary><p>Leather-specific care instructions will be provided for each finished piece.</p></details></div></div></main>;
}
