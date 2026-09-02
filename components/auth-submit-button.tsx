'use client'

import { useFormStatus } from 'react-dom'
import type { ReactNode } from 'react'

export function AuthSubmitButton({ children, pendingLabel, className }: { children: ReactNode; pendingLabel: string; className?: string }) {
  const { pending } = useFormStatus()
  return <button className={className} type="submit" disabled={pending}>{pending ? pendingLabel : children}</button>
}
