import Link from "next/link";
import { collections } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";
import { StorefrontHeader } from "@/components/storefront-header";
import { CategoryBrowser } from "@/components/category-browser";
import styles from "./page.module.css";

const fallbackCategories = [
  ...collections,
  { slug: "crossbody", name: "Crossbody Bags", description: "Hands-free shapes for everyday movement." },
  { slug: "evening", name: "Evening Bags", description: "Compact pieces for nights and occasions." },
];

export default async function CollectionsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("slug,name,description").eq("is_active", true).order("sort_order").order("name");
  const categories = data?.length ? data.map(item => ({ slug: item.slug, name: item.name, description: item.description || "Explore this Zorah collection." })) : fallbackCategories;

  return <main className={styles.page}>
    <StorefrontHeader />
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}><Link href="/shop">Home</Link><span>›</span> Categories</div>
      <div className={styles.titleRow}><h1>Categories</h1><p>Find your next Zorah bag</p></div>
      <section className={styles.panel}>
        <div className={styles.panelHeading}><h2>Shop by category</h2><span>{categories.length} categories</span></div>
        <CategoryBrowser categories={categories} />
      </section>
    </div>
  </main>;
}
