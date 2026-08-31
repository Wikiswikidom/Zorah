import Link from "next/link";
import { requireRole } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";
import ProductCatalogueFilters from "./product-catalogue-filters";

const allowedStatuses = new Set(["draft", "published", "archived"]);
const allowedSorts = new Set(["newest", "oldest", "name_asc", "name_desc", "price_asc", "price_desc"]);

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireRole(["catalog_admin"]);
  const params = await searchParams;
  const qRaw = typeof params.q === "string" ? params.q : "";
  const q = qRaw.trim().slice(0, 80);
  const status = typeof params.status === "string" && allowedStatuses.has(params.status) ? params.status : "all";
  const featured = params.featured === "yes" || params.featured === "no" ? params.featured : "all";
  const sort = typeof params.sort === "string" && allowedSorts.has(params.sort) ? params.sort : "newest";
  const supabase = await createClient();
  let query = supabase.from("products").select("id, name, slug, base_price, currency, status, is_featured, created_at", { count: "exact" });
  if (q) query = query.or(`name.ilike.%${q.replace(/[%_,]/g, "")}%,slug.ilike.%${q.replace(/[%_,]/g, "")}%`);
  if (status !== "all") query = query.eq("status", status);
  if (featured !== "all") query = query.eq("is_featured", featured === "yes");
  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    newest: { column: "created_at", ascending: false }, oldest: { column: "created_at", ascending: true },
    name_asc: { column: "name", ascending: true }, name_desc: { column: "name", ascending: false },
    price_asc: { column: "base_price", ascending: true }, price_desc: { column: "base_price", ascending: false },
  };
  const ordering = sortMap[sort];
  const { data: products, error, count } = await query.order(ordering.column, { ascending: ordering.ascending }).limit(100);
  return <main className="min-h-screen bg-[#F7F3EC] text-[#111111]"><header className="border-b border-black/10 bg-[#111111] text-[#F7F3EC]"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8"><div><Link href="/admin" className="font-serif text-2xl tracking-[.12em]">ZORAH</Link><p className="mt-1 text-[10px] uppercase tracking-[.25em] text-[#B08A3C]">Product catalogue</p></div><Link href="/admin" className="text-xs uppercase tracking-[.18em] text-white/75">Admin</Link></div></header><section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs uppercase tracking-[.2em] text-[#5A3524]">2D-3</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">Products</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-black/65">Create and maintain Zorah's catalogue. Server authorization and database RLS remain the source of truth.</p></div><Link href="/admin/products/new" className="rounded-full bg-[#173D32] px-5 py-3 text-center text-xs font-medium uppercase tracking-[.14em] text-[#F7F3EC]">New product</Link></div><ProductCatalogueFilters total={count ?? 0} /><div className="mt-5 overflow-hidden rounded-2xl border border-black/10 bg-white/70">{error?<div className="p-6 text-sm text-red-800">Catalogue could not be loaded. Please try again.</div>:products?.length?<div className="divide-y divide-black/10">{products.map(product=><div key={product.id} className="grid gap-4 p-5 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:px-6"><div><p className="font-serif text-xl">{product.name}</p><p className="mt-1 text-xs text-black/50">/{product.slug}</p></div><span className="text-xs uppercase tracking-[.12em] text-[#5A3524]">{product.status}</span><p className="text-sm font-medium">{product.currency} {Number(product.base_price).toLocaleString("en-NG")}</p><Link href={`/admin/products/${product.id}`} className="rounded-full border border-black/15 px-4 py-2 text-center text-xs uppercase tracking-[.12em] hover:border-[#B08A3C]">Edit</Link></div>)}</div>:<div className="p-10 text-center"><p className="font-serif text-2xl">{q||status!=="all"||featured!=="all"?"No matching products.":"No products yet."}</p><p className="mt-2 text-sm text-black/55">{q||status!=="all"||featured!=="all"?"Try changing your search or filters.":"Create your first catalogue product to begin."}</p></div>}</div></section></main>;
}
