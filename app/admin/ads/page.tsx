import Link from 'next/link'
import { requireRole } from '@/lib/auth/authorization'
import CampaignManager from '../campaigns/campaign-manager'

export default async function AdsAdminPage(){await requireRole(['ads_admin']);return <main><header><div><div><Link href="/admin" className="font-serif text-2xl tracking-[.12em]">ZORAH</Link><p className="mt-1 text-[10px] uppercase tracking-[.25em]">Growth / advertising</p></div><Link href="/admin" className="text-xs uppercase tracking-[.18em]">Admin overview</Link></div></header><section><div className="zorah-dashboard-hero"><div><p className="zorah-dashboard-kicker">Ads control</p><h1 className="mt-2 text-5xl">Advertising</h1><p className="zorah-dashboard-sub mt-3">Create, schedule, pause and retire promotional placements without giving the Ads Admin access to products, orders, customers or permissions.</p></div></div><div className="mt-6"><CampaignManager/></div></section></main>}
