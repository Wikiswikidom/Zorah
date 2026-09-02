import { requireStaff } from '@/lib/auth/authorization'
import { AdminShell } from '@/components/admin/admin-shell'
import './admin.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireStaff()
  return <AdminShell>{children}</AdminShell>
}
