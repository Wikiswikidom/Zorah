import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const AUTH_REQUIRED_ROUTES = ['/account','/checkout']
const isAuthRequiredRoute=(pathname:string)=>AUTH_REQUIRED_ROUTES.some(route=>pathname===route||pathname.startsWith(`${route}/`))
const isLandingRoute=(pathname:string)=>pathname==='/landing'||pathname.startsWith('/landing/')
const isAdminWorkspaceRoute=(pathname:string)=>pathname==='/admin'||pathname.startsWith('/admin/')
const ADMIN_ENTRY='/admin-login-zorah'

const adminNotFoundHtml=(origin:string)=>{
  const esc=(value:string)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')
  const login=`${origin}/login`
  const home=`${origin}/`
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Zorah Handbags — Page unavailable</title><style>html,body{margin:0;min-height:100%;background:#f7f3ec;color:#111;font-family:Arial,sans-serif}main{min-height:100svh;display:grid;place-items:center;padding:40px 24px;box-sizing:border-box}.card{width:min(100%,640px);box-sizing:border-box;background:#fff;border:1px solid rgba(17,17,17,.1);padding:56px 32px;text-align:center;box-shadow:0 24px 80px rgba(17,17,17,.08)}.brand{margin:0 0 30px;color:#b08a3c;font-size:10px;font-weight:700;letter-spacing:.28em;text-transform:uppercase}.mark{width:64px;height:64px;margin:0 auto 30px;display:grid;place-items:center;border-radius:50%;background:#173d32;color:#f7f3ec;font:400 28px Georgia,serif}.code{margin:0;color:rgba(17,17,17,.45);font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase}.title{margin:16px 0 0;font:400 clamp(42px,8vw,64px)/1 Georgia,serif;letter-spacing:-.035em}.copy{max-width:500px;margin:20px auto 0;color:rgba(17,17,17,.55);font-size:14px;line-height:1.8}.actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:34px}.actions a{min-height:44px;padding:0 22px;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;text-decoration:none;font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase}.primary{background:#173d32;color:#f7f3ec}.secondary{border:1px solid rgba(17,17,17,.15);color:#111}@media(max-width:520px){.card{padding:44px 22px}}</style></head><body><main><section class="card"><p class="brand">Zorah Handbags</p><div class="mark" aria-hidden="true">Z</div><p class="code">404 / Page unavailable</p><h1 class="title">We couldn't find that page.</h1><p class="copy">The page you're looking for isn't available. If you're trying to manage your Zorah account, continue to customer login.</p><div class="actions"><a class="primary" href="${esc(login)}">Customer Login</a><a class="secondary" href="${esc(home)}">Return Home</a></div></section></main></body></html>`
}

export async function updateSession(request:NextRequest){
 let response=NextResponse.next({request})
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 if(!url||!key)return response
 const supabase=createServerClient(url,key,{cookies:{getAll(){return request.cookies.getAll()},setAll(cookiesToSet,headers){cookiesToSet.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});cookiesToSet.forEach(({name,value,options})=>response.cookies.set(name,value,options));Object.entries(headers).forEach(([name,value])=>response.headers.set(name,value))}}})
 const{data:claimsData}=await supabase.auth.getClaims()
 const claims=claimsData?.claims as {sub?:string;aal?:string}|undefined
 const isAuthenticated=Boolean(claims)
 const pathname=request.nextUrl.pathname

 if(isAdminWorkspaceRoute(pathname)){
   const userId=typeof claims?.sub==='string'?claims.sub:''
   if(!userId)return new NextResponse(adminNotFoundHtml(request.nextUrl.origin),{status:404,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store, max-age=0','X-Robots-Tag':'noindex, nofollow'}})

   const{data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',userId).maybeSingle()
   const staffRoles=new Set(['super_admin','catalog_admin','order_admin','content_admin','marketing_admin','ads_admin','support_admin','analytics_admin','operations_admin'])
   const isStaff=Boolean(profile?.is_active&&profile.role&&staffRoles.has(profile.role))
   if(!isStaff)return new NextResponse(adminNotFoundHtml(request.nextUrl.origin),{status:404,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store, max-age=0','X-Robots-Tag':'noindex, nofollow'}})
   if(claims?.aal!=='aal2'){
     const next=`${pathname}${request.nextUrl.search}`
     return NextResponse.redirect(new URL(`/admin-mfa?next=${encodeURIComponent(next)}`,request.url))
   }
 }

 if(isAuthenticated&&(pathname==='/'||isLandingRoute(pathname)))return NextResponse.redirect(new URL('/shop',request.url))
 if(!isAuthenticated&&isAuthRequiredRoute(pathname)){const next=`${pathname}${request.nextUrl.search}`;return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}`,request.url))}
 return response
}
