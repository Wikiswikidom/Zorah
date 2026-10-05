import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireApiRole } from "@/lib/auth/authorization";

export const dynamic = "force-dynamic";

type SearchResult = { kind: "Product" | "Order" | "Customer"; label: string; detail: string; href: string };

function unavailable() {
  return NextResponse.json(
    { error: "Search is temporarily unavailable." },
    { status: 500, headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function GET(request: NextRequest) {
  const access = await requireApiRole([
    "catalog_admin", "order_admin", "support_admin", "analytics_admin",
    "operations_admin", "content_admin", "marketing_admin", "ads_admin",
  ]);
  if (!access.ok) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const query = (request.nextUrl.searchParams.get("q") ?? "")
    .trim()
    .replace(new RegExp("[^a-zA-Z0-9\\s@.'+-]", "g"), "")
    .slice(0, 80);
  if (query.length < 2) {
    return NextResponse.json({ results: [] }, { headers: { "Cache-Control": "private, no-store" } });
  }

  const supabase = await createClient();
  const pattern = "%" + query + "%";
  const results: SearchResult[] = [];
  const role = access.role;
  const isSuperAdmin = role === "super_admin";

  if (isSuperAdmin || role === "catalog_admin") {
    const { data, error } = await supabase.from("products")
      .select("id,name,slug,status")
      .or("name.ilike." + pattern + ",slug.ilike." + pattern)
      .order("created_at", { ascending: false }).limit(5);
    if (error) return unavailable();
    for (const product of data ?? []) {
      results.push({ kind: "Product", label: product.name, detail: "Product · " + product.status, href: "/admin/products/" + product.id });
    }
  }

  if (isSuperAdmin || role === "order_admin") {
    const { data, error } = await supabase.from("orders")
      .select("id,order_number,customer_name,email,status")
      .or("order_number.ilike." + pattern + ",customer_name.ilike." + pattern + ",email.ilike." + pattern)
      .order("created_at", { ascending: false }).limit(5);
    if (error) return unavailable();
    for (const order of data ?? []) {
      results.push({ kind: "Order", label: order.order_number, detail: (order.customer_name || order.email || "Customer") + " · " + order.status, href: "/admin/orders/" + order.id });
    }
  }

  if (isSuperAdmin || role === "support_admin") {
    const { data, error } = await supabase.from("profiles")
      .select("id,full_name,email")
      .eq("role", "customer")
      .or("full_name.ilike." + pattern + ",email.ilike." + pattern)
      .order("created_at", { ascending: false }).limit(5);
    if (error) return unavailable();
    for (const customer of data ?? []) {
      const label = customer.full_name || customer.email || "Zorah customer";
      const filter = customer.email || customer.full_name || query;
      results.push({ kind: "Customer", label, detail: customer.email || "Customer account", href: "/admin/customers?q=" + encodeURIComponent(filter) });
    }
  }

  return NextResponse.json(
    { results: results.slice(0, 12) },
    { headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } },
  );
}
