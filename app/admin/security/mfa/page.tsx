import { redirect } from 'next/navigation'
import { requireStaff } from '@/lib/auth/authorization'
import { AdminMfaManagement } from '@/components/admin/admin-mfa-management'

export default async function AdminMfaManagementPage() {
  const { role } = await requireStaff()
  if (role !== 'super_admin') redirect('/admin')
  return <AdminMfaManagement />
}
