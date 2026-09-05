import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic='force-dynamic'
export const revalidate=0

export async function GET(){
  try{
    const supabase=createAdminClient()
    const {data}=await supabase.from('site_settings').select('media_path').eq('key','site_favicon').maybeSingle()
    if(data?.media_path){
      const {data:publicData}=supabase.storage.from('brand-assets').getPublicUrl(data.media_path)
      if(publicData.publicUrl){
        const response=await fetch(publicData.publicUrl,{cache:'no-store'})
        if(response.ok)return new Response(await response.arrayBuffer(),{headers:{'Content-Type':response.headers.get('content-type')||'image/png','Cache-Control':'no-store, max-age=0'}})
      }
    }
  }catch(error){console.error('Dynamic favicon failed',error)}
  return new Response(null,{status:204})
}
