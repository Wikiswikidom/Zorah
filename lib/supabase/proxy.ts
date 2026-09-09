import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const COMMERCE_ROUTES = ['/shop','/collections','/products','/search','/cart','/checkout','/wishlist','/account','/custom-orders']
const isCommerceRoute=(pathname:string)=>COMMERCE_ROUTES.some(route=>pathname===route||pathname.startsWith(`${route}/`))
const isLandingRoute=(pathname:string)=>pathname==='/landing'||pathname.startsWith('/landing/')

export async function updateSession(request:NextRequest){
 let response=NextResponse.next({request})
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 if(!url||!key)return response
 const supabase=createServerClient(url,key,{cookies:{getAll(){return request.cookies.getAll()},setAll(cookiesToSet,headers){cookiesToSet.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});cookiesToSet.forEach(({name,value,options})=>response.cookies.set(name,value,options));Object.entries(headers).forEach(([name,value])=>response.headers.set(name,value))}}})
 const{data:claimsData}=await supabase.auth.getClaims()
 const isAuthenticated=Boolean(claimsData?.claims)
 const pathname=request.nextUrl.pathname
 if(isAuthenticated&&(pathname==='/'||isLandingRoute(pathname)))return NextResponse.redirect(new URL('/shop',request.url))
 if(!isAuthenticated&&isCommerceRoute(pathname)){const next=`${pathname}${request.nextUrl.search}`;return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}`,request.url))}
 return response
}
