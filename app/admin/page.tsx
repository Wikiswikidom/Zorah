import Link from "next/link";

const modules = [
  ["Products", "Manage products, variants, pricing, media and catalogue data.", "/admin/products"],
  ["Collections", "Organise products into curated collections.", "/admin/collections"],
  ["Inventory", "Monitor variant stock and record controlled adjustments.", "/admin/inventory"],
  ["Content", "Control approved landing-page content blocks.", "/admin/content"],
  ["Campaigns", "Manage promotions, flash sales and announcement bars.", "/admin/campaigns"],
  ["Journal", "Manage Zorah news and editorial stories.", "/admin/journal"],
  ["Merchandising", "Control featured, new and promoted products.", "/admin/merchandising"],
  ["Scheduling", "Schedule and monitor automated publishing workflows.", "/admin/scheduling"],
  ["Orders", "Order operations will connect in the commerce phase.", "/admin/orders"],
  ["Audit trail", "Review privileged administrative activity.", "/admin/audit"],
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#F7F3EC] text-[#111111]">
      <header className="border-b border-[#111111]/10 bg-[#111111] text-[#F7F3EC]"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8"><div><p className="font-serif text-2xl tracking-[0.12em]">ZORAH</p><p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-[#B08A3C]">Administration</p></div><Link href="/" className="text-xs uppercase tracking-[0.18em] text-[#F7F3EC]/75 hover:text-[#B08A3C]">View store</Link></div></header>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14"><div className="max-w-2xl"><p className="text-xs uppercase tracking-[0.2em] text-[#5A3524]">Control centre</p><h1 className="mt-3 font-serif text-4xl sm:text-5xl">Zorah Admin</h1><p className="mt-4 max-w-xl text-sm leading-7 text-[#111111]/65">A controlled workspace for catalogue, inventory, content, campaigns, scheduling and merchandising. Privileged actions are enforced by Supabase authentication, server authorization and database policies.</p></div><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{modules.map(([title, description, href])=><Link key={title} href={href} className="group rounded-2xl border border-[#111111]/10 bg-white/55 p-6 transition hover:-translate-y-0.5 hover:border-[#B08A3C]/60 hover:bg-white"><div className="flex items-start justify-between gap-4"><h2 className="font-serif text-xl">{title}</h2><span aria-hidden className="text-[#B08A3C] transition group-hover:translate-x-1">→</span></div><p className="mt-3 text-sm leading-6 text-[#111111]/60">{description}</p></Link>)}</div><div className="mt-10 rounded-2xl border border-[#173D32]/15 bg-[#173D32]/[0.04] p-6 text-sm leading-7 text-[#173D32]"><strong>Security boundary:</strong> the admin UI never grants privileges. Supabase Auth, server-side authorization and RLS remain the source of truth.</div></section>
    </main>
  );
}
