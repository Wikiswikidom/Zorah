import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 8 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : ''

async function validSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  if (file.type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (file.type === 'image/png') return bytes.slice(0, 8).every((value, index) => value === [137, 80, 78, 71, 13, 10, 26, 10][index])
  if (file.type === 'image/webp') return String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  if (file.type === 'image/avif') return String.fromCharCode(...bytes.slice(4, 8)) === 'ftyp'
  return false
}

export async function POST(request: Request) {
  let uploadedPath: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Please sign in before requesting a custom bag.' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', user.id).maybeSingle()
    if (!profile?.is_active || profile.role !== 'customer') {
      return NextResponse.json({ error: 'Custom bag requests are available from the customer shop account.' }, { status: 403 })
    }

    const form = await request.formData()
    const name = clean(form.get('name'), 160)
    const email = clean(form.get('email'), 320).toLowerCase()
    const phone = clean(form.get('phone'), 40)
    const bagStyle = clean(form.get('bag_style'), 120)
    const color = clean(form.get('color'), 120)
    const leatherPreference = clean(form.get('leather_preference'), 120)
    const budgetRaw = clean(form.get('budget'), 30)
    const details = clean(form.get('details'), 5000)
    const file = form.get('reference_image')

    if (name.length < 2 || !emailPattern.test(email) || details.length < 2) {
      return NextResponse.json({ error: 'Please provide your name, a valid email and a description of the bag you want.' }, { status: 400 })
    }
    if (budgetRaw && (!/^\d+(?:\.\d{1,2})?$/.test(budgetRaw) || Number(budgetRaw) < 0 || Number(budgetRaw) > 1_000_000_000)) {
      return NextResponse.json({ error: 'Please enter a valid budget.' }, { status: 400 })
    }

    const countWindow = new Date(Date.now() - 24 * 60 * 60_000).toISOString()
    const { count } = await supabase.from('custom_order_requests').select('id', { count: 'exact', head: true }).eq('customer_id', user.id).gte('created_at', countWindow)
    if ((count ?? 0) >= 5) return NextResponse.json({ error: 'You have reached the daily custom-request limit. Please contact Zorah if you need help with an existing request.' }, { status: 429 })

    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_FILE_SIZE || !ALLOWED_TYPES.has(file.type) || !(await validSignature(file))) {
        return NextResponse.json({ error: 'Reference images must be JPG, PNG, WebP or AVIF and no larger than 8 MiB.' }, { status: 400 })
      }
      const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1]
      uploadedPath = `${user.id}/${crypto.randomUUID()}.${extension}`
      const admin = createAdminClient()
      const { error: uploadError } = await admin.storage.from('custom-order-requests').upload(uploadedPath, file, { contentType: file.type, upsert: false })
      if (uploadError) throw new Error('upload')
    }

    const admin = createAdminClient()
    const { data, error } = await admin.from('custom_order_requests').insert({
      customer_id: user.id,
      name,
      email,
      phone: phone || null,
      bag_style: bagStyle || null,
      color: color || null,
      leather_preference: leatherPreference || null,
      budget: budgetRaw ? Number(budgetRaw) : null,
      details,
      reference_image_path: uploadedPath,
      reference_image_name: file instanceof File && file.size > 0 ? file.name.slice(0, 255) : null,
      status: 'new',
    }).select('id').single()

    if (error) {
      if (uploadedPath) await admin.storage.from('custom-order-requests').remove([uploadedPath])
      uploadedPath = null
      console.error('Custom order insert failed', error)
      return NextResponse.json({ error: 'We could not submit your custom bag request. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: data.id })
  } catch (error) {
    if (uploadedPath) {
      try { await createAdminClient().storage.from('custom-order-requests').remove([uploadedPath]) } catch {}
    }
    console.error('Custom order request failed', error)
    return NextResponse.json({ error: 'We could not submit your custom bag request. Please try again.' }, { status: 500 })
  }
}
