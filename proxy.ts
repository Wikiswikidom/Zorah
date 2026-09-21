import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'
import { rateLimit, requestIp } from '@/lib/security/rate-limit'

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

function rateLimitConfig(pathname:string){
  if(pathname==='/login'||pathname.startsWith('/login/'))return [8,60_000] as const
  if(pathname==='/admin-login'||pathname.startsWith('/admin-login/'))return [8,60_000] as const
  if(pathname==='/checkout'||pathname.startsWith('/checkout/'))return [20,60_000] as const
  if(pathname.startsWith('/api/admin/'))return [120,60_000] as const
  if(pathname.startsWith('/api/paystack/initialize')||pathname.startsWith('/api/paystack/verify'))return [20,60_000] as const
  if(pathname.startsWith('/api/contact')||pathname.startsWith('/api/custom-order')||pathname.startsWith('/api/waitlist'))return [20,60_000] as const
  return null
}

export async function proxy(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Cross-origin state-changing requests are not allowed.' }, { status: 403 })
  if(request.method!=='GET'&&request.method!=='HEAD'&&request.method!=='OPTIONS'){
    const config=rateLimitConfig(request.nextUrl.pathname)
    if(config){
      const [limit,windowMs]=config
      const result=rateLimit(`${request.nextUrl.pathname}:${requestIp(request)}`,limit,windowMs)
      if(!result.allowed)return NextResponse.json({error:'Too many requests. Please try again shortly.'},{status:429,headers:{'Retry-After':String(result.retryAfter),'Cache-Control':'no-store'}})
    }
  }
  return updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
