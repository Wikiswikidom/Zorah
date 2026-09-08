import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createAdminClient } from '@/lib/supabase/admin'

const text=(value:unknown,max:number)=>typeof value==='string'?value.trim().slice(0,max):''
const jsonError=(message:string,status=400)=>NextResponse.json({error:message},{status})
const allowedSlug='terms-and-conditions'

export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}){
  try{
    await requireRole(['content_admin'])
    const {slug}=await params
    if(slug!==allowedSlug)return jsonError('Legal page not found.',404)
    const supabase=createAdminClient()
    const {data,error}=await supabase.from('legal_pages').select('slug,title,body,version,is_published,updated_at').eq('slug',slug).maybeSingle()
    if(error)return jsonError('Could not load legal page.',500)
    if(!data)return jsonError('Legal page not found.',404)
    return NextResponse.json({page:data},{headers:{'Cache-Control':'no-store'}})
  }catch(error){console.error('Legal page GET failed',error);return jsonError('Unable to load legal page.',500)}
}

export async function PUT(request:Request,{params}:{params:Promise<{slug:string}>}){
  try{
    const {user}=await requireRole(['content_admin'])
    const {slug}=await params
    if(slug!==allowedSlug)return jsonError('Legal page not found.',404)
    if(!request.headers.get('content-type')?.toLowerCase().includes('application/json'))return jsonError('JSON request required.',415)
    const body=await request.json().catch(()=>null)
    if(!body||typeof body!=='object'||Array.isArray(body))return jsonError('Invalid request.')
    const input=body as Record<string,unknown>
    const title=text(input.title,160),content=text(input.body,30000),version=text(input.version,40)
    if(title.length<3||content.length<20||!version)return jsonError('Enter a title, meaningful terms text and a version.')
    const supabase=createAdminClient()
    const {data:existing}=await supabase.from('legal_pages').select('slug').eq('slug',slug).maybeSingle()
    if(!existing)return jsonError('Legal page not found.',404)
    const {error}=await supabase.from('legal_pages').update({title,body:content,version,is_published:input.is_published!==false,updated_by:user.id,updated_at:new Date().toISOString()}).eq('slug',slug)
    if(error)return jsonError('Could not save legal page.',400)
    return NextResponse.json({ok:true})
  }catch(error){console.error('Legal page PUT failed',error);return jsonError('Unable to save legal page.',500)}
}
