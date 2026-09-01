import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createClient } from '@/lib/supabase/server'

const types = new Set(['announcement','hero','banner','flash_sale','product_promotion','collection_promotion','editorial'])
const statuses = new Set(['draft','scheduled','live','paused','expired','archived'])
const placements = new Set(['landing','shop','both'])
const discounts = new Set(['none','percentage','fixed_amount'])
const text = (v: unknown, max: number) => typeof v === 'string' ? v.trim().slice(0, max) : ''
const href = (v: unknown) => { const value = text(v, 240); return !value || (/^\/(?!\/)[^\s]*$/.test(value)) ? (value || null) : undefined }
const jsonError = (message: string, status = 400) => NextResponse.json({ error: message }, { status })

function parse(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Invalid request.' }
  const b = body as Record<string, unknown>
  const name = text(b.name, 120), slug = text(b.slug, 120), title = text(b.title, 240)
  const campaign_type = text(b.campaign_type, 30), status = text(b.status, 20) || 'draft', placement = text(b.placement, 20) || 'landing'
  const discount_type = text(b.discount_type, 20) || 'none'
  const cta_href = href(b.cta_href)
  if (name.length < 2 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || title.length < 2 || !types.has(campaign_type) || !statuses.has(status) || !placements.has(placement) || !discounts.has(discount_type)) return { error: 'Check the campaign name, slug, type, status, placement and discount.' }
  if (cta_href === undefined) return { error: 'CTA link must be an internal path beginning with /.' }
  const priority = typeof b.priority === 'number' ? Math.floor(b.priority) : Number(b.priority ?? 0)
  if (!Number.isSafeInteger(priority) || priority < 0 || priority > 10000) return { error: 'Invalid campaign priority.' }
  const discount_value = b.discount_value === null || b.discount_value === undefined || b.discount_value === '' ? null : Number(b.discount_value)
  if (discount_value !== null && (!Number.isFinite(discount_value) || discount_value < 0 || (discount_type === 'percentage' && discount_value > 100))) return { error: 'Invalid discount value.' }
  const starts_at = b.starts_at ? new Date(String(b.starts_at)) : null
  const ends_at = b.ends_at ? new Date(String(b.ends_at)) : null
  if ((starts_at && Number.isNaN(starts_at.getTime())) || (ends_at && Number.isNaN(ends_at.getTime()))) return { error: 'Invalid campaign dates.' }
  if (starts_at && ends_at && ends_at <= starts_at) return { error: 'Campaign end time must be after its start time.' }
  if (status === 'live' && starts_at && starts_at > new Date()) return { error: 'A live campaign cannot start in the future.' }
  if (discount_type === 'none' && discount_value !== null) return { error: 'A campaign without a discount cannot have a discount value.' }
  return { data: { name, slug, campaign_type, status, title, message: text(b.message, 2000) || null, cta_label: text(b.cta_label, 80) || null, cta_href, media_path: text(b.media_path, 500) || null, placement, priority, starts_at: starts_at?.toISOString() ?? null, ends_at: ends_at?.toISOString() ?? null, show_countdown: b.show_countdown === true, discount_type, discount_value } }
}

export async function GET() {
  try {
    await requireRole(['marketing_admin', 'content_admin'])
    const supabase = await createClient()
    const { data, error } = await supabase.from('campaigns').select('id,name,slug,campaign_type,status,title,message,cta_label,cta_href,media_path,placement,priority,starts_at,ends_at,show_countdown,discount_type,discount_value,published_at,created_at,updated_at').order('priority', { ascending: false }).order('created_at', { ascending: false })
    if (error) return jsonError('Could not load campaigns.', 500)
    return NextResponse.json({ campaigns: data ?? [] })
  } catch { return jsonError('Unable to load campaigns.', 500) }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireRole(['marketing_admin'])
    const userId = user?.id
    if (!userId) return jsonError('Authentication required.', 401)
    if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) return jsonError('JSON request required.', 415)
    let body: unknown; try { body = await request.json() } catch { return jsonError('Invalid JSON request.') }
    const parsed = parse(body); if ('error' in parsed) return jsonError(parsed.error)
    const supabase = await createClient()
    const { data, error } = await supabase.from('campaigns').insert({ ...parsed.data, created_by: userId, updated_by: userId, published_at: parsed.data.status === 'live' ? new Date().toISOString() : null }).select('id').single()
    if (error) return jsonError(error.code === '23505' ? 'A campaign with this slug already exists.' : 'Could not create campaign.', error.code === '23505' ? 409 : 400)
    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch { return jsonError('Unable to create campaign.', 500) }
}
