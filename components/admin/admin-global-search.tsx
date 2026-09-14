"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const targets = [
  ["Orders", "/admin/orders", "orders purchases payment fulfilment"],
  ["Products", "/admin/products", "products catalogue bags pricing variants"],
  ["Categories", "/admin/categories", "categories product types"],
  ["Collections", "/admin/collections", "collections edits"],
  ["Inventory", "/admin/inventory", "inventory stock"],
  ["Customers", "/admin/customers", "customers users accounts"],
  ["Campaigns", "/admin/campaigns", "campaigns promotions"],
  ["Ads", "/admin/ads", "ads advertising"],
  ["Merchandising", "/admin/merchandising", "merchandising featured"],
  ["Website", "/admin/content", "landing homepage website content"],
  ["Journal", "/admin/journal", "journal editorial stories"],
  ["Enquiries", "/admin/enquiries", "contact custom bag requests support"],
  ["Team", "/admin/team", "team staff permissions roles"],
  ["Security", "/admin/security", "security password"],
  ["Audit", "/admin/audit", "audit history activity"],
] as const;

export function AdminGlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return targets.filter(([label, , keywords]) => `${label} ${keywords}`.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  return (
    <div className="zorah-admin-global-search">
      <span aria-hidden>⌕</span>
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(Boolean(query.trim()))}
        onKeyDown={(e) => {
          if (e.key === "Escape") { setOpen(false); setQuery(""); }
          if (e.key === "Enter" && results[0]) { router.push(results[0][1]); setOpen(false); setQuery(""); }
        }}
        placeholder="Search orders, products, customers…"
        aria-label="Search admin workspace"
      />
      {open && results.length > 0 && (
        <div className="zorah-admin-search-results" role="listbox">
          {results.map(([label, href]) => (
            <button key={href} type="button" onClick={() => { router.push(href); setOpen(false); setQuery(""); }}>
              <span>{label}</span><span>↗</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
