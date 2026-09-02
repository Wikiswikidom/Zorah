import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/authorization";

const modules = [
  ["Orders", "Order queue, payment state and fulfilment operations.", "/admin/orders"],
  ["Products", "Catalogue, pricing, variants and product media.", "/admin/products"],
  ["Collections", "Curate the edits customers discover first.", "/admin/collections"],
  ["Inventory", "Stock levels and controlled inventory adjustments.", "/admin/inventory"],
  ["Customers", "Customer accounts and support-facing profile operations.", "/admin/customers"],
  ["Campaigns", "Promotions, flash sales and announcement bars.", "/admin/campaigns"],
  ["Merchandising", "Control featured, new and promoted product placement.", "/admin/merchandising"],
  ["Landing page", "Manage approved brand storytelling sections.", "/admin/content"],
  ["Journal", "Publish Zorah news and editorial stories.", "/admin/journal"],
  ["Scheduling", "Monitor scheduled publishing and expiry jobs.", "/admin/scheduling"],
  ["Team & permissions", "Assign least-privilege admin roles.", "/admin/team"],
  ["Audit trail", "Review privileged administrative activity.", "/admin/audit"],
] as const;

export default async function AdminPage() {
  const { role } = await requireStaff();
  const supabase = await createClient();
  const [profiles, products, collections, campaigns, allProfiles, allProducts] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("collections").select("id", { count: "exact", head: true }),
    supabase.from("campaigns").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("role, is_active"),
    supabase.from("products").select("status"),
  ]);
  const roleCounts = (allProfiles.data ?? []).reduce<Record<string, number>>((acc, item) => { acc[item.role] = (acc[item.role] ?? 0) + 1; return acc; }, {});
  const productCounts = (allProducts.data ?? []).reduce<Record<string, number>>((acc, item) => { const status = String(item.status); acc[status] = (acc[status] ?? 0) + 1; return acc; }, {});
  const activeAccounts = (allProfiles.data ?? []).filter((item) => item.is_active).length;
  const totalProducts = allProducts.data?.length ?? 0;
  const publishedProducts = productCounts.published ?? 0;
  const productPercent = totalProducts ? Math.round((publishedProducts / totalProducts) * 100) : 0;

  return <main>
    <header><div><div><Link href="/admin" className="font-serif text-2xl tracking-[.12em]">ZORAH</Link><p className="mt-1 text-[10px] uppercase tracking-[.25em]">Commerce studio</p></div><Link href="/" className="text-xs uppercase tracking-[.18em] text-white/75">View brand site ↗</Link></div></header>
    <section>
      <div className="zorah-dashboard-hero"><div><p className="zorah-dashboard-kicker">Admin / overview</p><h1 className="mt-3 text-5xl sm:text-6xl">Good to see you.</h1><p className="zorah-dashboard-sub mt-4">A single control centre for the Zorah catalogue, campaigns, content, customers and publishing workflow.</p></div><div className="zorah-dashboard-actions"><Link href="/admin/products/new" className="zorah-dashboard-primary">Add product</Link><Link href="/shop" className="zorah-dashboard-secondary">Open storefront ↗</Link></div></div>
      <div className="zorah-dashboard-stats"><div className="zorah-dashboard-stat"><span>Accounts</span><strong>{profiles.count ?? 0}</strong><em>{activeAccounts} active</em></div><div className="zorah-dashboard-stat"><span>Products</span><strong>{products.count ?? 0}</strong><em>{publishedProducts} published</em></div><div className="zorah-dashboard-stat"><span>Collections</span><strong>{collections.count ?? 0}</strong><em>curated edits</em></div><div className="zorah-dashboard-stat"><span>Campaigns</span><strong>{campaigns.count ?? 0}</strong><em>promotion records</em></div></div>
      <div className="zorah-dashboard-analytics">
        <section className="zorah-dashboard-panel"><div className="zorah-dashboard-panel-head"><div><span>Business pulse</span><h2 className="mt-2 text-2xl">At a glance</h2></div></div><div className="zorah-chart-row"><div className="zorah-donut" style={{ background: `conic-gradient(#173d32 0 ${productPercent}%, #e7e0d5 ${productPercent}% 100%)` }}><div><strong>{productPercent}%</strong><span>published</span></div></div><div className="zorah-chart-copy"><div><strong>{totalProducts}</strong><span>catalogue products</span></div><div><strong>{roleCounts.super_admin ?? 0}</strong><span>super admin</span></div><div><strong>{Object.entries(roleCounts).filter(([key]) => key !== 'customer').reduce((sum,[,count])=>sum+count,0)}</strong><span>staff accounts</span></div></div></div></section>
        <section className="zorah-dashboard-panel"><div className="zorah-dashboard-panel-head"><div><span>Access mix</span><h2 className="mt-2 text-2xl">Team roles</h2></div><Link href="/admin/team">Manage →</Link></div><div className="zorah-role-bars">{Object.entries(roleCounts).map(([key,count])=><div key={key}><div><span>{key.replaceAll('_',' ')}</span><b>{count}</b></div><i><em style={{width:`${Math.max(5,Math.round((count/(allProfiles.data?.length||1))*100))}%`}} /></i></div>)}</div></section>
      </div>
      <div className="zorah-dashboard-grid"><section className="zorah-dashboard-panel"><div className="zorah-dashboard-panel-head"><div><span>Workspace</span><h2 className="mt-2 text-2xl">Manage Zorah</h2></div><Link href="/admin/audit">View activity →</Link></div><div className="zorah-dashboard-modules">{modules.map(([title, description, href]) => <Link key={href} href={href} className="zorah-dashboard-module"><div><strong>{title}</strong><p>{description}</p></div><i aria-hidden>↗</i></Link>)}</div></section><aside className="zorah-dashboard-panel"><div className="zorah-dashboard-panel-head"><div><span>Access</span><h2 className="mt-2 text-2xl">Current role</h2></div></div><div className="zorah-dashboard-note"><strong>{role.replaceAll("_", " ")}</strong><p>Permissions are enforced server-side and by database RLS. The dashboard never grants access by itself.</p></div><div className="mt-6 border-t border-black/10 pt-5"><p className="text-xs text-black/55">Revenue</p><p className="mt-2 text-sm leading-6 text-black/70">Order persistence and verified Paystack revenue are not connected yet, so this dashboard deliberately does not invent a sales number.</p></div></aside></div>
    </section>
  </main>
}
