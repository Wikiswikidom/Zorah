import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
const CSRF_EXEMPT_PATHS = new Set(['/api/paystack/webhook'])

function originFromRequest(request: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  return configured || request.nextUrl.origin
}

function sameOrigin(request: NextRequest) {
  if (CSRF_EXEMPT_PATHS.has(request.nextUrl.pathname) || SAFE_METHODS.has(request.method)) return true
  const target = originFromRequest(request)
  const origin = request.headers.get('origin')
  if (origin) return origin === target
  const referer = request.headers.get('referer')
  if (referer) {
    try { return new URL(referer).origin === target } catch { return false }
  }
  const fetchSite = request.headers.get('sec-fetch-site')
  return fetchSite === 'same-origin' || fetchSite === 'none'
}

export async function proxy(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Cross-origin state-changing requests are not allowed.' }, { status: 403 })
  return updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
