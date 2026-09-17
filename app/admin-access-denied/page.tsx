import Link from 'next/link'
import './page.css'

export default function AdminAccessDeniedPage(){
  return <main className="zorah-access-denied"><div className="zorah-access-card"><p className="zorah-access-kicker">Zorah / Private area</p><div className="zorah-access-mark">Z</div><h1>This area is not available.</h1><p>The Commerce Studio is restricted to approved Zorah staff accounts. Your customer account can continue shopping normally.</p><div className="zorah-access-actions"><Link href="/shop">Back to shop</Link><Link href="/">Back to Zorah</Link></div></div></main>
}
