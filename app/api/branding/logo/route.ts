import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase=createAdminClient()
    const { data }=await supabase.from('site_settings').select('media_path').eq('key','site_logo').maybeSingle()
    if(data?.media_path){
      const { data:publicData }=supabase.storage.from('brand-assets').getPublicUrl(data.media_path)
      if(publicData.publicUrl)return Response.json({url:publicData.publicUrl},{headers:{'Cache-Control':'no-store, max-age=0'}})
    }
  } catch(error){ console.error('Public logo lookup failed',error) }
  return Response.json({url:null},{headers:{'Cache-Control':'no-store, max-age=0'}})
}
