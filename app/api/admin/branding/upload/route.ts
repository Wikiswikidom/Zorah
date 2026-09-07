import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createClient } from '@/lib/supabase/server'

const ALLOWED = new Set(['image/png','image/jpeg','image/webp','image/svg+xml','image/x-icon','image/vnd.microsoft.icon','image/avif'])
const MAX = 5 * 1024 * 1024
const BUCKET = 'brand-assets'
const KEYS = new Set(['site_logo','site_favicon'])

function validSignature(file: File, head: Uint8Array, text: string) {
  if (file.type === 'image/jpeg') return head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff
  if (file.type === 'image/png') return head.slice(0,8).every((x,i) => x === [137,80,78,71,13,10,26,10][i])
  if (file.type === 'image/webp') return String.fromCharCode(...head.slice(0,4)) === 'RIFF' && String.fromCharCode(...head.slice(8,12)) === 'WEBP'
  if (file.type === 'image/avif') return String.fromCharCode(...head.slice(4,8)) === 'ftyp'
  if (file.type === 'image/x-icon' || file.type === 'image/vnd.microsoft.icon') return head.length >= 4 && head[0] === 0 && head[1] === 0 && (head[2] === 1 || head[2] === 2) && head[3] === 0
  if (file.type === 'image/svg+xml') return /^\s*(?:<\?xml[^>]*>\s*)?<svg\b/i.test(text) && !/<script\b|on[a-z]+\s*=|javascript:/i.test(text)
  return false
}

export async function POST(request: Request) {
  try {
    const { user } = await requireRole(['content_admin','marketing_admin'])
    const form = await request.formData()
    const key = form.get('key')
    const file = form.get('file')
    if (typeof key !== 'string' || !KEYS.has(key)) return NextResponse.json({ error: 'Invalid branding asset.' }, { status: 400 })
    if (!(file instanceof File)) return NextResponse.json({ error: 'Please choose an image file.' }, { status: 400 })
    if (file.size < 1 || file.size > MAX) return NextResponse.json({ error: 'Brand artwork must be 5 MiB or smaller.' }, { status: 400 })
    if (!ALLOWED.has(file.type)) return NextResponse.json({ error: 'Unsupported format. Use PNG, JPG, WebP, SVG, AVIF or ICO.' }, { status: 415 })

    const head = new Uint8Array(await file.slice(0, 32).arrayBuffer())
    const text = file.type === 'image/svg+xml' ? await file.slice(0, 8192).text() : ''
    if (!validSignature(file, head, text)) return NextResponse.json({ error: 'The selected file is not a valid image.' }, { status: 400 })

    const extension = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/x-icon' || file.type === 'image/vnd.microsoft.icon' ? 'ico' : file.type.split('/')[1]
    const path = `branding/${key}/${crypto.randomUUID()}.${extension}`
    const supabase = await createClient()
    const upload = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, cacheControl: '31536000', upsert: false })
    if (upload.error) {
      console.error('Branding upload failed', upload.error)
      return NextResponse.json({ error: 'Could not upload the brand asset.' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const { error } = await supabase.from('site_settings').upsert({ key, media_path: path, updated_by: user.id, updated_at: now }, { onConflict: 'key' })
    if (error) {
      await supabase.storage.from(BUCKET).remove([path])
      console.error('Branding setting save failed', error)
      return NextResponse.json({ error: 'Could not save the brand asset.' }, { status: 500 })
    }

    const mediaUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl || null
    return NextResponse.json({ ok: true, key, path, media_path: path, media_url: mediaUrl, updated_at: now }, { status: 201 })
  } catch (error) {
    console.error('Branding upload route failed', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to upload brand asset.' }, { status: 500 })
  }
}
