import Link from "next/link";
import { collections } from "@/lib/catalog";

export default function CollectionsPage() {
  return <main className="page-shell"><div className="page-intro"><p className="eyebrow">Discover by intention</p><h1 className="page-title">Collections</h1><p className="page-lede">Start with how you want to carry, then let the silhouette lead the way.</p></div><div className="collection-list">{collections.map((item, index) => <Link className={`collection-panel tone-${index}`} key={item.slug} href={`/shop?collection=${item.slug}`}><span className="collection-number">0{index + 1}</span><div><h2>{item.name}</h2><p>{item.description}</p><span className="text-link">Explore collection →</span></div></Link>)}</div></main>;
}
