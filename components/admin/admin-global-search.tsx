"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
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

type EntityResult = { kind: string; label: string; detail: string; href: string };

export function AdminGlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [entityResults, setEntityResults] = useState<EntityResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);

  function navigate(href: string) {
    setOpen(false);
    setQuery("");
    startTransition(() => router.push(href));
  }
  const moduleResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return targets.filter(([label, , keywords]) => `${label} ${keywords}`.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  useEffect(() => {
    const q = query.trim();
    setEntityResults([]);
    setSearchError(false);
    if (q.length < 2) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/admin/search?q=" + encodeURIComponent(q), {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Search unavailable");
        const data = await response.json();
        setEntityResults(Array.isArray(data.results) ? data.results : []);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setEntityResults([]);
          setSearchError(true);
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const results = useMemo(() => [
    ...moduleResults.map(([label, href]) => ({ kind: "Workspace", label, detail: "Open workspace section", href })),
    ...entityResults,
  ].slice(0, 8), [moduleResults, entityResults]);

  return (
    <div className="zorah-admin-global-search">
      <span aria-hidden>{isPending || isSearching ? <span className="zorah-action-spinner" /> : "⌕"}</span>
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(Boolean(query.trim()))}
        onKeyDown={(e) => {
          if (e.key === "Escape") { setOpen(false); setQuery(""); }
          if (e.key === "Enter" && results[0]) { navigate(results[0].href); }
        }}
        placeholder={isPending ? "Opening workspace…" : isSearching ? "Searching…" : "Search products, orders, customers…"}
        aria-label="Search admin workspace"
      />
      {open && (results.length > 0 || isSearching) && (
        <div className="zorah-admin-search-results" role="listbox" aria-busy={isSearching}>
          {results.map((result) => (
            <button key={result.kind + ":" + result.href} type="button" disabled={isPending} onClick={() => navigate(result.href)}>
              <span><strong>{result.label}</strong><small>{result.detail}</small></span><span>{isPending ? "…" : "↗"}</span>
            </button>
          ))}
          {isSearching && <p role="status">Searching secure workspace records…</p>}
          {searchError && <p role="alert">Search is temporarily unavailable. Try again in a moment.</p>}
        </div>
      )}
    </div>
  );
}
