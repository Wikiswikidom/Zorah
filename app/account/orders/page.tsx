import Link from 'next/link'
import { AccountSubpage } from '@/components/account-subpage'

export default function OrdersPage(){return <AccountSubpage title="Orders" description="Track purchases, delivery and returns in one place." icon="▣"><div className="jumia-empty-card"><div className="jumia-empty-icon">▣</div><h2>No orders yet</h2><p>Your completed purchases will appear here.</p><Link className="jumia-primary-btn" href="/shop">Start Shopping</Link></div></AccountSubpage>}
