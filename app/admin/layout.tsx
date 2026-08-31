import { requireStaff } from '@/lib/auth/authorization'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireStaff()
  return children
}
