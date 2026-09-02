"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  { label: "Overview", items: [["Dashboard", "/admin", "DB"]] },
  { label: "Commerce", items: [["Orders", "/admin/orders", "OR"], ["Products", "/admin/products", "PR"], ["Collections", "/admin/collections", "CO"], ["Inventory", "/admin/inventory", "IN"], ["Customers", "/admin/customers", "CU"]] },
  { label: "Growth", items: [["Campaigns", "/admin/campaigns", "CA"], ["Merchandising", "/admin/merchandising", "ME"]] },
  { label: "Content", items: [["Landing page", "/admin/content", "LP"], ["Journal", "/admin/journal", "JO"], ["Scheduling", "/admin/scheduling", "SC"]] },
  { label: "Governance", items: [["Audit trail", "/admin/audit", "AU"]] },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="zorah-admin-shell">
      <aside className="zorah-admin-sidebar">
        <div className="zorah-admin-brand">
          <Link href="/admin" className="zorah-admin-wordmark">ZORAH</Link>
          <span>Commerce studio</span>
        </div>
        <nav className="zorah-admin-nav" aria-label="Administration">
          {groups.map((group) => (
            <div className="zorah-admin-nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map(([label, href, icon]) => {
                const active = href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
                const unavailable = href === "/admin/orders" || href === "/admin/customers";
                return (
                  <Link key={href} href={href} className={`zorah-admin-nav-link ${active ? "is-active" : ""}`}>
                    <span className="zorah-admin-nav-icon" aria-hidden>{icon}</span>
                    <span>{label}</span>
                    {unavailable && <small>soon</small>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="zorah-admin-sidebar-foot">
          <Link href="/" className="zorah-admin-quiet-link">View brand site ↗</Link>
          <Link href="/shop" className="zorah-admin-quiet-link">View storefront ↗</Link>
        </div>
      </aside>

      <div className="zorah-admin-main">
        <div className="zorah-admin-mobilebar">
          <Link href="/admin" className="zorah-admin-wordmark">ZORAH</Link>
          <Link href="/shop" className="zorah-admin-mobile-store">Storefront ↗</Link>
        </div>
        {children}
      </div>
    </div>
  );
}
