import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/account'
  return value
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl
  const origin = url.origin
  const next = safeNextPath(url.searchParams.get('next'))
  const code = url.searchParams.get('code')
  const oauthError = url.searchParams.get('error')

  if (oauthError) return NextResponse.redirect(new URL(`/login?error=oauth&next=${encodeURIComponent(next)}`, origin))
  if (!code) return NextResponse.redirect(new URL(`/login?error=oauth&next=${encodeURIComponent(next)}`, origin))

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return NextResponse.redirect(new URL(`/login?error=oauth&next=${encodeURIComponent(next)}`, origin))

  return NextResponse.redirect(new URL(next, origin))
}
