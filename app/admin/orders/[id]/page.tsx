import { requireRole } from '@/lib/auth/authorization'
import { AdminOrderDetail } from './admin-order-detail'
import './admin-order-detail.css'

export default async function AdminOrderPage({params}:{params:Promise<{id:string}>}){
  await requireRole(['order_admin'])
  const {id}=await params
  return <AdminOrderDetail orderId={id}/>
}
