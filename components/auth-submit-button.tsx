'use client'

import { useFormStatus } from 'react-dom'
import type { ReactNode } from 'react'
import { LoadingSpinner } from './loading-spinner'

export function AuthSubmitButton({ children, pendingLabel, className }: { children: ReactNode; pendingLabel: string; className?: string }) {
  const { pending } = useFormStatus()
  return <button className={className} type="submit" disabled={pending}>{pending ? <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8}}><LoadingSpinner label={pendingLabel} size={15}/>{pendingLabel}</span> : children}</button>
}
