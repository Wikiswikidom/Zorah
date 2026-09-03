import { AdminShell } from '@/components/admin/admin-shell'
import { requireStaff } from '@/lib/auth/authorization'
import './admin.css'
import './admin-premium.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role } = await requireStaff()
  return <AdminShell role={role}>{children}</AdminShell>
}
