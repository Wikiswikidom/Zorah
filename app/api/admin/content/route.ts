import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth/authorization'
import { createAdminClient } from '@/lib/supabase/admin'

const types=new Set(['hero','promo','product_rail','editorial','craft','collections','custom_order','journal','testimonial','newsletter','media'])
const themes=new Set(['light','dark','leather','green','ivory'])
const statuses=new Set(['draft','published','archived'])
const text=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):''
const href=(v:unknown)=>{const value=text(v,240);return!value||(/^\/(?!\/)[^\s]*$/.test(value))?(value||null):undefined}
const jsonError=(message:string,status=400)=>NextResponse.json({error:message},{status})

function parse(body:unknown){
  if(!body||typeof body!=='object'||Array.isArray(body))return{error:'Invalid request.'}
  const b=body as Record<string,unknown>
  const section_key=text(b.section_key,80),section_type=text(b.section_type,30),theme=text(b.theme,20)||'light',status=text(b.status,20)||'draft',primary_cta_href=href(b.primary_cta_href),secondary_cta_href=href(b.secondary_cta_href)
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(section_key)||!types.has(section_type)||!themes.has(theme)||!statuses.has(status))return{error:'Check the section key, type, theme and status.'}
  if(primary_cta_href===undefined||secondary_cta_href===undefined)return{error:'CTA links must be internal paths beginning with /.'}
  const sort_order=typeof b.sort_order==='number'?Math.floor(b.sort_order):Number(b.sort_order??0)
  if(!Number.isSafeInteger(sort_order)||sort_order<0||sort_order>10000)return{error:'Invalid display order.'}
  let scheduled_publish_at:string|null=null
  if(b.scheduled_publish_at){if(typeof b.scheduled_publish_at!=='string'||Number.isNaN(Date.parse(b.scheduled_publish_at)))return{error:'Invalid scheduled publish date.'};scheduled_publish_at=new Date(b.scheduled_publish_at).toISOString();if(status==='published'&&new Date(scheduled_publish_at)>new Date())return{error:'Published sections cannot have a future publish time.'}}
  return{data:{section_key,section_type,eyebrow:text(b.eyebrow,120)||null,title:text(b.title,240)||null,body:text(b.body,3000)||null,primary_cta_label:text(b.primary_cta_label,80)||null,primary_cta_href,secondary_cta_label:text(b.secondary_cta_label,80)||null,secondary_cta_href,media_path:text(b.media_path,500)||null,theme,is_enabled:b.is_enabled!==false,sort_order,status,scheduled_publish_at}}
}

async function signedSections(supabase:any,data:any[]){
  return Promise.all((data??[]).map(async section=>{
    if(!section.media_path)return{...section,media_url:null}
    const result=await supabase.storage.from('product-media').createSignedUrl(section.media_path,3600)
    return{...section,media_url:result.data?.signedUrl??null}
  }))
}

export async function GET(){
  try{
    await requireRole(['content_admin','marketing_admin'])
    const supabase=createAdminClient()
    const{data,error}=await supabase.from('landing_sections').select('id,section_key,section_type,eyebrow,title,body,primary_cta_label,primary_cta_href,secondary_cta_label,secondary_cta_href,media_path,theme,is_enabled,sort_order,status,scheduled_publish_at,published_at,created_at,updated_at').order('sort_order').order('created_at')
    if(error)return jsonError('Could not load landing-page content.',500)
    return NextResponse.json({sections:await signedSections(supabase,data??[])})
  }catch(error){
    console.error('Landing CMS GET failed',error)
    return jsonError('Unable to load landing-page content.',500)
  }
}

export async function POST(request:Request){
  try{
    const{user}=await requireRole(['content_admin','marketing_admin'])
    if(!request.headers.get('content-type')?.toLowerCase().includes('application/json'))return jsonError('JSON request required.',415)
    const parsed=parse(await request.json().catch(()=>null))
    if(!('data'in parsed))return jsonError(parsed.error??'Invalid request.')
    const parsedData=parsed.data
    if(!parsedData)return jsonError('Invalid landing-section payload.',500)
    const supabase=createAdminClient()
    if(parsedData.section_type==='hero'){
      const{count}=await supabase.from('landing_sections').select('id',{count:'exact',head:true}).eq('section_type','hero').neq('status','archived')
      if((count??0)>=5)return jsonError('Zorah supports a maximum of 5 hero slides.',409)
    }
    const{data,error}=await supabase.from('landing_sections').insert({...parsedData,created_by:user.id,updated_by:user.id,published_at:parsedData.status==='published'?new Date().toISOString():null}).select('id').single()
    if(error)return jsonError(error.code==='23505'?'A section with this key already exists.':'Could not create section.',error.code==='23505'?409:400)
    revalidatePath('/')
    return NextResponse.json({id:data.id},{status:201})
  }catch(error){console.error('Landing CMS POST failed',error);return jsonError('Unable to create landing section.',500)}
}
