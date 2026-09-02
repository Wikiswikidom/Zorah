import Link from "next/link";
import { requireRole } from "@/lib/auth/authorization";

export default async function AdminOrdersPage() {
  await requireRole(["order_admin"]);
  return <main><header><div><div><Link href="/admin" className="font-serif text-2xl tracking-[.12em]">ZORAH</Link><p className="mt-1 text-[10px] uppercase tracking-[.25em]">Order operations</p></div><Link href="/admin" className="text-xs uppercase tracking-[.18em]">Admin overview</Link></div></header><section><p className="zorah-dashboard-kicker">Commerce / fulfilment</p><h1 className="mt-3 text-5xl">Orders</h1><p className="zorah-dashboard-sub mt-4">The operations surface is ready for the commerce order tables and Paystack transaction workflow. No order data is fabricated here.</p><div className="zorah-dashboard-panel mt-8"><p className="text-xs uppercase tracking-[.16em] text-[#B08A3C]">Commerce phase</p><h2 className="mt-3 text-3xl">Order infrastructure is the next connection.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-black/60">Once checkout and payment persistence are connected, this page will handle order status, payment verification, fulfilment, refunds and customer communication from the same protected admin shell.</p></div></section></main>;
}
