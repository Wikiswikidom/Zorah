import Link from "next/link";
import { collections } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";
import { StorefrontHeader } from "@/components/storefront-header";
import { CategoryBrowser } from "@/components/category-browser";

const fallbackCategories = [
  ...collections,
  { slug: "crossbody", name: "Crossbody Bags", description: "Hands-free shapes for everyday movement." },
  { slug: "evening", name: "Evening Bags", description: "Compact pieces for nights and occasions." },
];

export default async function CollectionsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("slug,name,description")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  const categories = data?.length
    ? data.map(item => ({ slug: item.slug, name: item.name, description: item.description || "Explore this Zorah collection." }))
    : fallbackCategories;

  return <main className="jumia-market-page">
    <StorefrontHeader />
    <div className="jumia-market-wrap">
      <div className="jumia-breadcrumb"><Link href="/shop">Home</Link><span>›</span> Categories</div>
      <div className="jumia-page-title-row">
        <div><h1>Categories</h1><p>Find your next Zorah bag</p></div>
      </div>
      <section className="jumia-category-panel">
        <div className="jumia-panel-heading"><h2>Shop by category</h2><span>{categories.length} categories</span></div>
        <CategoryBrowser categories={categories} />
      </section>
    </div>
  </main>;
}
