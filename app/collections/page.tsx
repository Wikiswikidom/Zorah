import Link from "next/link";
import { collections } from "@/lib/catalog";
import { StorefrontHeader } from "@/components/storefront-header";

const categoryIcons=['▣','◈','◇','◌','□','✦'];
const categories=[...collections,{slug:'crossbody',name:'Crossbody Bags',description:'Hands-free shapes for everyday movement.'},{slug:'evening',name:'Evening Bags',description:'Compact pieces for nights and occasions.'}];

export default function CollectionsPage() {
  return <main className="jumia-market-page"><StorefrontHeader/><div className="jumia-market-wrap"><div className="jumia-breadcrumb"><Link href="/">Home</Link><span>›</span> Categories</div><div className="jumia-page-title-row"><h1>Categories</h1><span>Find your next Zorah bag</span></div><section className="jumia-category-panel"><h2>Shop by category</h2><div className="jumia-category-grid">{categories.map((item,index)=><Link href={`/shop?collection=${item.slug}`} className="jumia-category-card" key={item.slug}><div className="jumia-category-icon">{categoryIcons[index%categoryIcons.length]}</div><div><strong>{item.name}</strong><span>{item.description}</span></div><b>›</b></Link>)}</div></section><div className="jumia-category-cta"><div><h2>Not sure what to choose?</h2><p>Browse every Zorah handbag and filter by style, colour and availability.</p></div><Link className="jumia-primary-btn" href="/shop">View All Bags</Link></div></div></main>;
}
