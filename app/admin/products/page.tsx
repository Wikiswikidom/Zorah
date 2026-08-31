import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, base_price, currency, status, is_featured, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#111111]">
      <header className="border-b border-[#111111]/10 bg-[#111111] text-[#F7F3EC]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <div>
            <Link href="/admin" className="font-serif text-2xl tracking-[0.12em]">ZORAH</Link>
            <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-[#B08A3C]">Product catalogue</p>
          </div>
          <Link href="/admin" className="text-xs uppercase tracking-[0.18em] text-[#F7F3EC]/75 hover:text-[#B08A3C]">Admin</Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#5A3524]">2D-3</p>
            <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Products</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#111111]/65">The catalogue is backed by Supabase. Draft products stay private; only published products are eligible for public discovery.</p>
          </div>
          <button disabled className="rounded-full bg-[#173D32] px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#F7F3EC] opacity-60">New product — UI next</button>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-[#111111]/10 bg-white/70">
          {error ? (
            <div className="p-6 text-sm text-red-800">Catalogue could not be loaded. Check the authenticated Supabase session and RLS configuration.</div>
          ) : products?.length ? (
            <div className="divide-y divide-[#111111]/10">
              {products.map((product) => (
                <div key={product.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:px-6">
                  <div>
                    <p className="font-serif text-xl">{product.name}</p>
                    <p className="mt-1 text-xs text-[#111111]/50">/{product.slug}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.12em] text-[#5A3524]">{product.status}</span>
                  <p className="text-sm font-medium">{product.currency} {Number(product.base_price).toLocaleString("en-NG")}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <p className="font-serif text-2xl">No products yet.</p>
              <p className="mt-2 text-sm text-[#111111]/55">The catalogue database is ready. Product creation UI is the next implementation slice.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
