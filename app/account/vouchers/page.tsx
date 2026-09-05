import Link from 'next/link'
import { AccountSubpage } from '@/components/account-subpage'

export default function VouchersPage(){return <AccountSubpage title="Vouchers & Offers" description="Your available Zorah promotions, rewards and voucher codes." icon="◇"><div className="jumia-empty-card"><div className="jumia-empty-icon">◇</div><h2>No active vouchers</h2><p>Available offers will appear here when they are assigned to your account.</p><Link className="jumia-primary-btn" href="/shop">Continue Shopping</Link></div></AccountSubpage>}
