import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/auth/authorization"
import { createAdminClient } from "@/lib/supabase/admin"

const types = new Set(["announcement","hero","banner","flash_sale","product_promotion","collection_promotion","editorial"])
const statuses = new Set(["draft","scheduled","live","paused","expired","archived"])
const placements = new Set(["landing","shop","both"])
const discounts = new Set(["none","percentage","fixed_amount"])
const text = (v: unknown, max: number) => typeof v === "string" ? v.trim().slice(0, max) : ""
const slugify = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120)
const href = (v: unknown) => { const value = text(v, 240); return !value || /^\/(?!\/)[^\s]*$/.test(value) ? (value || null) : undefined }
const errorResponse = (message: string, status = 400) => NextResponse.json({ error: message }, { status })

function channelAllowed(role: string, channel: string) {
  return role === "super_admin" || (role === "marketing_admin" && channel === "campaign") || (role === "ads_admin" && channel === "ad")
}
function parse(body: unknown, channel: "campaign" | "ad") {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { error: "Invalid request." }
  const b = body as Record<string, unknown>
  const name = text(b.name, 120)
  const slug = slugify(text(b.slug, 120) || name)
  const title = text(b.title, 240) || name
  const campaign_type = types.has(text(b.campaign_type, 30)) ? text(b.campaign_type, 30) : "banner"
  const status = statuses.has(text(b.status, 20)) ? text(b.status, 20) : "draft"
  const placement = placements.has(text(b.placement, 20)) ? text(b.placement, 20) : "landing"
  const discount_type = discounts.has(text(b.discount_type, 20)) ? text(b.discount_type, 20) : "none"
  const cta_href = href(b.cta_href)
  if (name.length < 2 || !slug || title.length < 2) return { error: "Check the campaign name, slug and title." }
  if (cta_href === undefined) return { error: "CTA link must be an internal path beginning with /." }
  const priority = typeof b.priority === "number" ? Math.floor(b.priority) : Number(b.priority ?? 0)
  if (!Number.isSafeInteger(priority) || priority < 0 || priority > 10000) return { error: "Invalid campaign priority." }
  const discount_value = b.discount_value === null || b.discount_value === undefined || b.discount_value === "" ? null : Number(b.discount_value)
  if (discount_value !== null && (!Number.isFinite(discount_value) || discount_value < 0 || (discount_type === "percentage" && discount_value > 100))) return { error: "Invalid discount value." }
  const starts_at = b.starts_at ? new Date(String(b.starts_at)) : null
  const ends_at = b.ends_at ? new Date(String(b.ends_at)) : null
  if ((starts_at && Number.isNaN(starts_at.getTime())) || (ends_at && Number.isNaN(ends_at.getTime()))) return { error: "Invalid campaign dates." }
  if (starts_at && ends_at && ends_at <= starts_at) return { error: "Campaign end time must be after its start time." }
  if (status === "live" && starts_at && starts_at > new Date()) return { error: "A live campaign cannot start in the future." }
  if (discount_type === "none" && discount_value !== null) return { error: "A campaign without a discount cannot have a discount value." }
  return { data: { channel, name, slug, campaign_type, status, title, message: text(b.message, 2000) || null, cta_label: text(b.cta_label, 80) || null, cta_href, media_path: text(b.media_path, 500) || null, placement, priority, starts_at: starts_at?.toISOString() ?? null, ends_at: ends_at?.toISOString() ?? null, show_countdown: b.show_countdown === true, discount_type, discount_value } }
}

export async function GET(request: Request) {
  const auth = await requireApiRole(["marketing_admin","ads_admin"])
  if (!auth.ok) return errorResponse(auth.error, auth.status)
  const channel = new URL(request.url).searchParams.get("channel") === "ad" ? "ad" : "campaign"
  if (!channelAllowed(auth.role, channel)) return errorResponse("You do not have permission for this channel.", 403)
  try {
    const s = createAdminClient()
    const { data, error } = await s.from("campaigns").select("id,name,slug,campaign_type,status,title,message,cta_label,cta_href,media_path,placement,priority,starts_at,ends_at,show_countdown,discount_type,discount_value,published_at,created_at,updated_at,channel").eq("channel", channel).order("priority", { ascending: false }).order("created_at", { ascending: false })
    if (error) throw error
    const campaigns = (data ?? []).map(c => ({ ...c, media_url: c.media_path ? s.storage.from("landing-media").getPublicUrl(c.media_path).data.publicUrl : null }))
    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error("Campaign GET failed", error)
    return errorResponse("Unable to load campaigns.", 500)
  }
}

export async function POST(request: Request) {
  const auth = await requireApiRole(["marketing_admin","ads_admin"])
  if (!auth.ok) return errorResponse(auth.error, auth.status)
  const channel = new URL(request.url).searchParams.get("channel") === "ad" ? "ad" : "campaign"
  if (!channelAllowed(auth.role, channel)) return errorResponse("You do not have permission for this channel.", 403)
  try {
    if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) return errorResponse("JSON request required.", 415)
    const parsed = parse(await request.json().catch(() => null), channel)
    if (!("data" in parsed)) return errorResponse(parsed.error ?? "Invalid request.")
    const s = createAdminClient()
    const { data, error } = await s.from("campaigns").insert({ ...parsed.data, created_by: auth.user.id, updated_by: auth.user.id, published_at: parsed.data.status === "live" ? new Date().toISOString() : null }).select("id").single()
    if (error) return errorResponse(error.code === "23505" ? "A campaign with this slug already exists." : "Could not create campaign.", error.code === "23505" ? 409 : 400)
    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch (error) {
    console.error("Campaign POST failed", error)
    return errorResponse("Unable to create campaign.", 500)
  }
}
