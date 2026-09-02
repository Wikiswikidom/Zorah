'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

function safeNextPath(value: FormDataEntryValue | null) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/account'
  return value
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const next = safeNextPath(formData.get('next'))

  if (!email || !password || email.length > 320 || password.length > 1024) {
    redirect(`/login?error=invalid&next=${encodeURIComponent(next)}`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) redirect(`/login?error=invalid&next=${encodeURIComponent(next)}`)
  redirect(next)
}

export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const fullName = String(formData.get('fullName') ?? '').trim().slice(0, 160)

  if (!email || !password || email.length > 320 || password.length < 10 || password.length > 1024) {
    redirect('/login?error=signup_invalid')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })

  if (error) redirect('/login?error=signup_failed')
  redirect('/login?message=check_email')
}

export async function signInWithGoogle(formData: FormData) {
  const next = safeNextPath(formData.get('next'))
  const supabase = await createClient()
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  const requestHeaders = await headers()
  const forwardedProto = requestHeaders.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'https'
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host')
  const requestOrigin = host ? `${forwardedProto}://${host}` : ''
  const origin = configuredOrigin || requestOrigin

  if (!origin) redirect('/login?error=configuration')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (error || !data.url) redirect('/login?error=oauth')
  redirect(data.url)
}
