"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { StaffRole } from "@/lib/auth/authorization";

type Item=[string,string,string];
const groups:{label:string;items:Item[]}[]=[
  {label:"Overview",items:[["Dashboard","/admin","DB"]]},
  {label:"Commerce",items:[["Orders","/admin/orders","OR"],["Products","/admin/products","PR"],["Categories","/admin/categories","CT"],["Collections","/admin/collections","CO"],["Inventory","/admin/inventory","IN"],["Customers","/admin/customers","CU"],["Waitlist","/admin/waitlist","WL"]]},
  {label:"Growth",items:[["Campaigns","/admin/campaigns","CA"],["Merchandising","/admin/merchandising","ME"]]},
  {label:"Content",items:[["Landing page","/admin/content","LP"],["Journal","/admin/journal","JO"],["Scheduling","/admin/scheduling","SC"]]},
  {label:"Support",items:[["Enquiries","/admin/enquiries","EN"]]},
  {label:"Governance",items:[["Team & permissions","/admin/team","TM"],["Security","/admin/security","SE"],["Audit trail","/admin/audit","AU"]]},
];
const permissions:Record<StaffRole,string[]>= {
  super_admin: groups.flatMap(g=>g.items.map(i=>i[1])),
  catalog_admin:["/admin/products","/admin/categories","/admin/collections","/admin/inventory"],
  order_admin:["/admin/orders"],
  content_admin:["/admin/content","/admin/journal"],
  marketing_admin:["/admin/campaigns","/admin/merchandising"],
  support_admin:["/admin/customers","/admin/waitlist","/admin/enquiries"],
  operations_admin:["/admin/scheduling"],
  analytics_admin:["/admin"],
};

export function AdminShell({children,role}:{children:React.ReactNode;role:StaffRole}){
  const pathname=usePathname();
  const allowed=permissions[role]??[];
  const visibleGroups=groups.map(g=>({...g,items:g.items.filter(([,href])=>allowed.includes(href))})).filter(g=>g.items.length);
  return <div className="zorah-admin-shell" data-role={role}>
    <aside className="zorah-admin-sidebar">
      <div className="zorah-admin-brand"><Link href="/admin" className="zorah-admin-wordmark">ZORAH</Link><span>Commerce studio</span></div>
      <nav className="zorah-admin-nav" aria-label="Administration">
        {visibleGroups.map(group=><div className="zorah-admin-nav-group" key={group.label}><p>{group.label}</p>{group.items.map(([label,href,icon])=>{const active=href==="/admin"?pathname===href:pathname===href||pathname.startsWith(`${href}/`);return <Link key={href} href={href} className={`zorah-admin-nav-link ${active?"is-active":""}`}><span className="zorah-admin-nav-icon" aria-hidden>{icon}</span><span>{label}</span></Link>})}</div>)}
      </nav>
      <div className="zorah-admin-sidebar-foot"><span className="zorah-admin-role-chip">{role.replaceAll('_',' ')}</span><Link href="/" className="zorah-admin-quiet-link">View brand site ↗</Link><Link href="/shop" className="zorah-admin-quiet-link">View storefront ↗</Link></div>
    </aside>
    <div className="zorah-admin-main">
      <div className="zorah-admin-mobilebar"><Link href="/admin" className="zorah-admin-wordmark">ZORAH</Link><span className="zorah-admin-mobile-role">{role.replaceAll('_',' ')}</span><Link href="/shop" className="zorah-admin-mobile-store">Storefront ↗</Link></div>
      {children}
    </div>
  </div>
}
