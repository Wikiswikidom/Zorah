import Link from "next/link";
import { requireRole } from "@/lib/auth/authorization";
import LandingCms from "@/components/admin/landing-cms";

export default async function AdminContentPage(){
  await requireRole(["content_admin","marketing_admin"]);
  return <main className="zorah-content-page">
    <header className="zorah-content-header">
      <Link href="/admin" className="zorah-content-brand">ZORAH</Link>
      <Link href="/" className="zorah-content-store-link">View store ↗</Link>
    </header>
    <section className="zorah-content-wrap">
      <div className="zorah-content-intro">
        <h1>Landing page</h1>
        <p>Edit the customer homepage without touching code. Manage the logo, hero slides, photography, copy, buttons, sections, order and visibility from one workspace.</p>
      </div>
      <LandingCms/>
    </section>
  </main>
}
