import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/authorization";

const modules = [
  ["Products", "Catalogue, pricing, variants and product media.", "/admin/products"],
  ["Collections", "Curate the edits customers discover first.", "/admin/collections"],
  ["Inventory", "Stock levels and controlled inventory adjustments.", "/admin/inventory"],
  ["Campaigns", "Promotions, flash sales and announcement bars.", "/admin/campaigns"],
  ["Merchandising", "Control featured, new and promoted product placement.", "/admin/merchandising"],
  ["Landing page", "Manage approved brand storytelling sections.", "/admin/content"],
  ["Journal", "Publish Zorah news and editorial stories.", "/admin/journal"],
  ["Scheduling", "Monitor scheduled publishing and expiry jobs.", "/admin/scheduling"],
  ["Audit trail", "Review privileged administrative activity.", "/admin/audit"],
] as const;

export default async function AdminPage() {
  const { role } = await requireStaff();
  const supabase = await createClient();
  const [profiles, products, collections, campaigns] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("collections").select("id", { count: "exact", head: true }),
    supabase.from("campaigns").select("id", { count: "exact", head: true }),
  ]);

  return (
    <main>
      <header><div><div><Link href="/admin" className="font-serif text-2xl tracking-[.12em]">ZORAH</Link><p className="mt-1 text-[10px] uppercase tracking-[.25em]">Commerce studio</p></div><Link href="/" className="text-xs uppercase tracking-[.18em] text-white/75">View brand site ↗</Link></div></header>
      <section>
        <div className="zorah-dashboard-hero">
          <div>
            <p className="zorah-dashboard-kicker">Admin / overview</p>
            <h1 className="mt-3 text-5xl sm:text-6xl">Good to see you.</h1>
            <p className="zorah-dashboard-sub mt-4">One control centre for the Zorah catalogue, campaigns, content and publishing workflow. The storefront remains customer-facing; this space is for operating it.</p>
          </div>
          <div className="zorah-dashboard-actions">
            <Link href="/admin/products/new" className="zorah-dashboard-primary">Add product</Link>
            <Link href="/shop" className="zorah-dashboard-secondary">Open storefront ↗</Link>
          </div>
        </div>

        <div className="zorah-dashboard-stats">
          <div className="zorah-dashboard-stat"><span>Accounts</span><strong>{profiles.count ?? 0}</strong><em>registered profiles</em></div>
          <div className="zorah-dashboard-stat"><span>Products</span><strong>{products.count ?? 0}</strong><em>catalogue records</em></div>
          <div className="zorah-dashboard-stat"><span>Collections</span><strong>{collections.count ?? 0}</strong><em>curated edits</em></div>
          <div className="zorah-dashboard-stat"><span>Campaigns</span><strong>{campaigns.count ?? 0}</strong><em>promotion records</em></div>
        </div>

        <div className="zorah-dashboard-grid">
          <section className="zorah-dashboard-panel">
            <div className="zorah-dashboard-panel-head"><div><span>Workspace</span><h2 className="mt-2 text-2xl">Manage Zorah</h2></div><Link href="/admin/audit">View activity →</Link></div>
            <div className="zorah-dashboard-modules">
              {modules.map(([title, description, href]) => <Link key={href} href={href} className="zorah-dashboard-module"><div><strong>{title}</strong><p>{description}</p></div><i aria-hidden>↗</i></Link>)}
            </div>
          </section>
          <aside className="zorah-dashboard-panel">
            <div className="zorah-dashboard-panel-head"><div><span>Access</span><h2 className="mt-2 text-2xl">Current role</h2></div></div>
            <div className="zorah-dashboard-note"><strong>{role.replaceAll("_", " ")}</strong><p>Permissions are enforced by Supabase Auth, server-side authorization and database RLS. The dashboard itself never grants access.</p></div>
            <div className="mt-6 border-t border-black/10 pt-5"><p className="text-xs text-black/55">Next commerce layer</p><p className="mt-2 text-sm leading-6 text-black/70">Orders, fulfilment and customer operations can be connected here without weakening the existing security boundary.</p></div>
          </aside>
        </div>
      </section>
    </main>
  );
}
