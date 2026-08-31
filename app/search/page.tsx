import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/catalog";

export default function SearchPage() { return <main className="page-shell"><div className="page-intro"><p className="eyebrow">Find your piece</p><h1 className="page-title">Search</h1><div className="search-box"><input aria-label="Search Zorah" placeholder="Search handbags, collections, materials…" /><button>Search</button></div></div><div className="product-grid">{products.map((product) => <ProductCard key={product.slug} {...product} />)}</div></main>; }
