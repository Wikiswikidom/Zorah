import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createClient } from '@/lib/supabase/server'

const types = new Set(['hero','promo','product_rail','editorial','craft','collections','custom_order','journal','testimonial','newsletter','media'])
const themes = new Set(['light','dark','leather','green','ivory'])
const statuses = new Set(['draft','published','archived'])
const text = (v: unknown, max: number) => typeof v === 'string' ? v.trim().slice(0, max) : ''
const href = (v: unknown) => { const value = text(v, 240); return !value || (/^\/(?!\/)[^\s]*$/.test(value)) ? (value || null) : undefined }
const jsonError = (message: string, status = 400) => NextResponse.json({ error: message }, { status })
function parse(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Invalid request.' }
  const b = body as Record<string, unknown>
  const section_key = text(b.section_key, 80), section_type = text(b.section_type, 30), theme = text(b.theme, 20) || 'light', status = text(b.status, 20) || 'draft'
  const primary_cta_href = href(b.primary_cta_href), secondary_cta_href = href(b.secondary_cta_href)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(section_key) || !types.has(section_type) || !themes.has(theme) || !statuses.has(status)) return { error: 'Check the section key, type, theme and status.' }
  if (primary_cta_href === undefined || secondary_cta_href === undefined) return { error: 'CTA links must be internal paths beginning with /.' }
  const sort_order = typeof b.sort_order === 'number' ? Math.floor(b.sort_order) : Number(b.sort_order ?? 0)
  if (!Number.isSafeInteger(sort_order) || sort_order < 0 || sort_order > 10000) return { error: 'Invalid display order.' }
  let scheduled_publish_at: string | null = null
  if (b.scheduled_publish_at) { if (typeof b.scheduled_publish_at !== 'string' || Number.isNaN(Date.parse(b.scheduled_publish_at))) return { error: 'Invalid scheduled publish date.' }; scheduled_publish_at = new Date(b.scheduled_publish_at).toISOString(); if (status === 'published' && new Date(scheduled_publish_at) > new Date()) return { error: 'Published sections cannot have a future publish time.' } }
  return { data: { section_key, section_type, eyebrow: text(b.eyebrow, 120) || null, title: text(b.title, 240) || null, body: text(b.body, 3000) || null, primary_cta_label: text(b.primary_cta_label, 80) || null, primary_cta_href, secondary_cta_label: text(b.secondary_cta_label, 80) || null, secondary_cta_href, media_path: text(b.media_path, 500) || null, theme, is_enabled: b.is_enabled !== false, sort_order, status, scheduled_publish_at } }
}
export async function GET() { try { await requireRole(['content_admin','marketing_admin']); const supabase=await createClient(); const {data,error}=await supabase.from('landing_sections').select('id,section_key,section_type,eyebrow,title,body,primary_cta_label,primary_cta_href,secondary_cta_label,secondary_cta_href,media_path,theme,is_enabled,sort_order,status,scheduled_publish_at,published_at,created_at,updated_at').order('sort_order').order('created_at'); if(error)return jsonError('Could not load landing-page content.',500); return NextResponse.json({sections:data??[]}) } catch { return jsonError('Unable to load landing-page content.',500) } }
export async function POST(request:Request) { try { const {user}=await requireRole(['content_admin','marketing_admin']); const userId=user.id; if(!request.headers.get('content-type')?.toLowerCase().includes('application/json'))return jsonError('JSON request required.',415); let body:unknown; try{body=await request.json()}catch{return jsonError('Invalid JSON request.')}; const parsed=parse(body); if(!('data' in parsed))return jsonError(parsed.error); const supabase=await createClient(); const {data,error}=await supabase.from('landing_sections').insert({...parsed.data,created_by:userId,updated_by:userId,published_at:parsed.data.status==='published'?new Date().toISOString():null}).select('id').single(); if(error)return jsonError(error.code==='23505'?'A section with this key already exists.':'Could not create section.',error.code==='23505'?409:400); return NextResponse.json({id:data.id},{status:201}) } catch { return jsonError('Unable to create landing section.',500) } }
