import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX = 5 * 1024 * 1024
const TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
])

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

async function validSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer())
  const starts = (values: number[]) => values.every((value, index) => bytes[index] === value)

  if (file.type === 'image/jpeg') return starts([0xff, 0xd8, 0xff])
  if (file.type === 'image/png') return starts([137, 80, 78, 71, 13, 10, 26, 10])
  if (file.type === 'image/webp') {
    return String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  }
  if (file.type === 'image/x-icon' || file.type === 'image/vnd.microsoft.icon') {
    return bytes[0] === 0 && bytes[1] === 0 && bytes[2] === 1 && bytes[3] === 0
  }
  if (file.type === 'image/svg+xml') {
    const head = new TextDecoder().decode(bytes).replace(/^\uFEFF/, '').trimStart().toLowerCase()
    return head.startsWith('<svg') || head.startsWith('<?xml')
  }
  return false
}

export async function POST(request: Request) {
  try {
    await requireRole(['content_admin', 'marketing_admin'])
    const form = await request.formData()
    const file = form.get('file')
    const kind = form.get('kind')

    if (!(file instanceof File)) return jsonError('Image file is required.')
    if (kind !== 'logo' && kind !== 'favicon') return jsonError('Invalid branding asset type.')
    if (file.size < 1 || file.size > MAX) return jsonError('Brand artwork must be between 1 byte and 5 MiB.')
    if (!TYPES.has(file.type) || !(await validSignature(file))) return jsonError('Unsupported or invalid image format.')

    const extension = file.type === 'image/jpeg' ? 'jpg'
      : file.type === 'image/svg+xml' ? 'svg'
      : file.type === 'image/x-icon' || file.type === 'image/vnd.microsoft.icon' ? 'ico'
      : file.type.split('/')[1]

    const path = `branding/${kind}-${crypto.randomUUID()}.${extension}`
    const supabase = createAdminClient()
    const upload = await supabase.storage.from('product-media').upload(path, file, {
      contentType: file.type,
      upsert: false,
      cacheControl: '31536000',
    })

    if (upload.error) {
      console.error('Brand asset storage upload failed', upload.error)
      return jsonError('Could not upload brand artwork.', 500)
    }

    const signed = await supabase.storage.from('product-media').createSignedUrl(path, 3600)
    return NextResponse.json({ path, url: signed.data?.signedUrl ?? null }, { status: 201 })
  } catch (error) {
    console.error('Brand asset upload failed', error)
    return jsonError('Unable to upload brand artwork.', 500)
  }
}
