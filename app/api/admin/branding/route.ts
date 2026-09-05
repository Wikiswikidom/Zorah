import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createAdminClient } from '@/lib/supabase/admin'

const KEYS = ['site_logo','site_favicon'] as const
const KEY_SET = new Set(KEYS)
const BUCKET = 'brand-assets'
const jsonError = (message:string,status=400) => NextResponse.json({error:message},{status})

function publicUrl(supabase:ReturnType<typeof createAdminClient>,path:string|null){
  if(!path)return null
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl||null
}

export async function GET(){
  try{
    await requireRole(['content_admin','marketing_admin'])
    const supabase=createAdminClient()
    const {data,error}=await supabase.from('site_settings').select('key,media_path,updated_at').in('key',KEYS)
    if(error){console.error('Brand settings GET query failed',error);return jsonError('Unable to load brand settings.',500)}
    const rows=data??[]
    const settings=Object.fromEntries(KEYS.map(key=>{
      const row=rows.find(item=>item.key===key)
      return [key,{media_path:row?.media_path??null,media_url:publicUrl(supabase,row?.media_path??null),updated_at:row?.updated_at??null}]
    }))
    return NextResponse.json({settings},{headers:{'Cache-Control':'no-store'}})
  }catch(error){console.error('Brand settings GET failed',error);return jsonError(error instanceof Error?error.message:'Unable to load brand settings.',500)}
}

export async function POST(request:Request){
  try{
    const {user}=await requireRole(['content_admin','marketing_admin'])
    if(!request.headers.get('content-type')?.toLowerCase().includes('application/json'))return jsonError('JSON request required.',415)
    const body=await request.json().catch(()=>null) as {key?:unknown;media_path?:unknown}|null
    const key=typeof body?.key==='string'?body.key:''
    const mediaPath=typeof body?.media_path==='string'?body.media_path.trim().slice(0,500):''
    if(!KEY_SET.has(key as typeof KEYS[number]))return jsonError('Invalid branding key.')
    if(!mediaPath||!mediaPath.startsWith('branding/'))return jsonError('Invalid brand asset path.')
    const supabase=createAdminClient()
    const {error}=await supabase.from('site_settings').upsert({key,media_path:mediaPath,updated_by:user.id,updated_at:new Date().toISOString()},{onConflict:'key'})
    if(error){console.error('Brand setting save failed',error);return jsonError('Unable to save brand setting.',500)}
    return NextResponse.json({ok:true,key,media_path:mediaPath,media_url:publicUrl(supabase,mediaPath)})
  }catch(error){console.error('Brand settings POST failed',error);return jsonError(error instanceof Error?error.message:'Unable to save brand artwork.',500)}
}

export async function DELETE(request:Request){
  try{
    const {user}=await requireRole(['content_admin','marketing_admin'])
    const key=new URL(request.url).searchParams.get('key')||''
    if(!KEY_SET.has(key as typeof KEYS[number]))return jsonError('Invalid branding key.')
    const supabase=createAdminClient()
    const {error}=await supabase.from('site_settings').upsert({key,media_path:null,updated_by:user.id,updated_at:new Date().toISOString()},{onConflict:'key'})
    if(error){console.error('Brand setting delete failed',error);return jsonError('Unable to remove brand setting.',500)}
    return NextResponse.json({ok:true})
  }catch(error){console.error('Brand settings DELETE failed',error);return jsonError(error instanceof Error?error.message:'Unable to remove brand setting.',500)}
}
