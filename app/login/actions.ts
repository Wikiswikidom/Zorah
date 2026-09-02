'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

function safeNextPath(value: FormDataEntryValue | null) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/account'
  return value
}

async function requestOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (configured) return configured
  const requestHeaders = await headers()
  const proto = requestHeaders.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'https'
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host')
  return host ? `${proto}://${host}` : ''
}

function loginError(error: { message?: string; status?: number } | null) {
  const message = error?.message?.toLowerCase() || ''
  if (error?.status === 429 || message.includes('rate limit')) return 'rate_limit'
  if (message.includes('email not confirmed')) return 'email_not_confirmed'
  return 'invalid'
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const next = safeNextPath(formData.get('next'))

  if (!email || !password || email.length > 320 || password.length > 1024) redirect(`/login?error=invalid&next=${encodeURIComponent(next)}`)

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect(`/login?error=${loginError(error)}&next=${encodeURIComponent(next)}`)

  revalidatePath('/', 'layout')
  redirect(next)
}

export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const fullName = String(formData.get('fullName') ?? '').trim().slice(0, 160)
  const next = safeNextPath(formData.get('next'))

  if (!email || !password || email.length > 320 || password.length < 10 || password.length > 1024) redirect(`/login?error=signup_invalid&next=${encodeURIComponent(next)}`)

  const origin = await requestOrigin()
  if (!origin) redirect(`/login?error=configuration&next=${encodeURIComponent(next)}`)

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName }, emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  })

  if (error) {
    const message = error.message.toLowerCase()
    if (error.status === 429 || message.includes('rate limit')) redirect(`/login?error=signup_rate_limit&next=${encodeURIComponent(next)}`)
    if (message.includes('invalid') && message.includes('email')) redirect(`/login?error=signup_email_invalid&next=${encodeURIComponent(next)}`)
    redirect(`/login?error=signup_failed&next=${encodeURIComponent(next)}`)
  }

  revalidatePath('/', 'layout')
  if (data.session) redirect(next)
  redirect(`/login?message=check_email&next=${encodeURIComponent(next)}`)
}

export async function signInWithGoogle(formData: FormData) {
  const next = safeNextPath(formData.get('next'))
  const origin = await requestOrigin()
  if (!origin) redirect(`/login?error=configuration&next=${encodeURIComponent(next)}`)

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`, queryParams: { access_type: 'offline', prompt: 'select_account' } },
  })

  if (error || !data.url) {
    const message = error?.message?.toLowerCase() || ''
    if (message.includes('provider is not enabled')) redirect(`/login?error=google_provider&next=${encodeURIComponent(next)}`)
    redirect(`/login?error=oauth&next=${encodeURIComponent(next)}`)
  }
  redirect(data.url)
}
