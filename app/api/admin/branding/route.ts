import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createAdminClient } from '@/lib/supabase/admin'

const KEYS = new Set(['site_logo','site_favicon'])
const BUCKET = 'brand-assets'
const jsonError = (message:string,status=400) => NextResponse.json({error:message},{status})

function publicUrl(path:string|null) {
  if (!path) return null
  const supabase = createAdminClient()
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

export async function GET() {
  try {
    await requireRole(['content_admin','marketing_admin'])
    const supabase = createAdminClient()
    const { data,error } = await supabase.from('site_settings').select('key,media_path,updated_at').in('key',['site_logo','site_favicon'])
    if (error) { console.error('Brand settings GET query failed',error); return jsonError('Unable to load brand settings.',500) }
    const settings = Object.fromEntries((data ?? []).map(row => [row.key,{media_path:row.media_path,media_url:publicUrl(row.media_path)}]))
    return NextResponse.json({settings})
  } catch (error) { console.error('Brand settings GET failed',error); return jsonError('Unable to load brand settings.',500) }
}

export async function POST(request:Request) {
  try {
    const { user } = await requireRole(['content_admin','marketing_admin'])
    if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) return jsonError('JSON request required.',415)
    const body = await request.json().catch(()=>null) as {key?:unknown;media_path?:unknown}|null
    const key = typeof body?.key==='string' ? body.key : ''
    const mediaPath = typeof body?.media_path==='string' ? body.media_path.trim().slice(0,500) : ''
    if (!KEYS.has(key)) return jsonError('Invalid branding key.')
    if (!mediaPath || !mediaPath.startsWith('branding/')) return jsonError('Invalid brand asset path.')
    const supabase=createAdminClient()
    const { error } = await supabase.from('site_settings').upsert({key,media_path:mediaPath,updated_by:user.id,updated_at:new Date().toISOString()},{onConflict:'key'})
    if (error) { console.error('Brand setting save failed',error); return jsonError('Unable to save brand setting.',500) }
    return NextResponse.json({ok:true,key,media_path:mediaPath,media_url:publicUrl(mediaPath)})
  } catch (error) { console.error('Brand settings POST failed',error); return jsonError('Unable to save brand artwork.',500) }
}

export async function DELETE(request:Request) {
  try {
    const { user } = await requireRole(['content_admin','marketing_admin'])
    const key = new URL(request.url).searchParams.get('key') || ''
    if (!KEYS.has(key)) return jsonError('Invalid branding key.')
    const supabase=createAdminClient()
    const { error } = await supabase.from('site_settings').update({media_path:null,updated_by:user.id,updated_at:new Date().toISOString()}).eq('key',key)
    if (error) { console.error('Brand setting delete failed',error); return jsonError('Unable to remove brand setting.',500) }
    return NextResponse.json({ok:true})
  } catch (error) { console.error('Brand settings DELETE failed',error); return jsonError('Unable to remove brand setting.',500) }
}
