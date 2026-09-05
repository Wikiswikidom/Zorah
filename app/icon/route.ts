import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase.from('site_settings').select('media_path').eq('key', 'site_favicon').maybeSingle()
    if (data?.media_path) {
      const { data: signed } = await supabase.storage.from('product-media').createSignedUrl(data.media_path, 60)
      if (signed?.signedUrl) {
        const response = await fetch(signed.signedUrl, { cache: 'no-store' })
        if (response.ok) {
          const type = response.headers.get('content-type') || 'image/png'
          return new Response(await response.arrayBuffer(), { headers: { 'Content-Type': type, 'Cache-Control': 'no-store, max-age=0' } })
        }
      }
    }
  } catch (error) {
    console.error('Dynamic favicon failed', error)
  }

  return new Response(null, { status: 204 })
}
