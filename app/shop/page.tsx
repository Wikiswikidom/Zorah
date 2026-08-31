import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/catalog";

export default function ShopPage() {
  return <main className="page-shell"><div className="page-intro"><p className="eyebrow">The collection</p><h1 className="page-title">Shop handbags</h1><p className="page-lede">A focused edit of leather silhouettes made in Lagos. Filter, compare and discover pieces at your own pace.</p></div><div className="shop-toolbar"><span>{products.length} pieces</span><span>Filter · Sort</span></div><div className="product-grid">{products.map((product) => <ProductCard key={product.slug} {...product} />)}</div></main>;
}
