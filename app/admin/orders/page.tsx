import { requireRole } from '@/lib/auth/authorization'
import { OrderPaymentsManager } from './order-payments-manager'
import './payment-ops.css'

export default async function AdminOrdersPage() {
  await requireRole(['order_admin'])
  return <OrderPaymentsManager />
}
