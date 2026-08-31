import { ShopControls } from "@/components/shop-controls";
import { products } from "@/lib/catalog";
export default function ShopPage() { return <main className="page-shell"><div className="page-intro"><p className="eyebrow">The collection</p><h1 className="page-title">Shop handbags</h1><p className="page-lede">A focused edit of leather silhouettes made in Lagos. Refine by category, colour or availability, then sort the pieces around what matters to you.</p></div><ShopControls products={products} /></main>; }
