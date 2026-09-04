import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth/authorization'
import { createAdminClient } from '@/lib/supabase/admin'

const types=new Set(['hero','promo','product_rail','editorial','craft','collections','custom_order','journal','testimonial','newsletter','media'])
const themes=new Set(['light','dark','leather','green','ivory'])
const statuses=new Set(['draft','published','archived'])
const text=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):''
const href=(v:unknown)=>{const value=text(v,240);return!value||(/^\/(?!\/)[^\s]*$/.test(value))?(value||null):undefined}
const errorResponse=(message:string,status=400)=>NextResponse.json({error:message},{status})

function parse(body:unknown){
  if(!body||typeof body!=='object'||Array.isArray(body))return{error:'Invalid request.'}
  const b=body as Record<string,unknown>,section_key=text(b.section_key,80),section_type=text(b.section_type,30),theme=text(b.theme,20)||'light',status=text(b.status,20)||'draft',primary_cta_href=href(b.primary_cta_href),secondary_cta_href=href(b.secondary_cta_href)
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(section_key)||!types.has(section_type)||!themes.has(theme)||!statuses.has(status))return{error:'Check the section key, type, theme and status.'}
  if(primary_cta_href===undefined||secondary_cta_href===undefined)return{error:'CTA links must be internal paths beginning with /.'}
  const sort_order=typeof b.sort_order==='number'?Math.floor(b.sort_order):Number(b.sort_order??0)
  if(!Number.isSafeInteger(sort_order)||sort_order<0||sort_order>10000)return{error:'Invalid display order.'}
  let scheduled_publish_at:string|null=null
  if(b.scheduled_publish_at){if(typeof b.scheduled_publish_at!=='string'||Number.isNaN(Date.parse(b.scheduled_publish_at)))return{error:'Invalid scheduled publish date.'};scheduled_publish_at=new Date(b.scheduled_publish_at).toISOString()}
  return{data:{section_key,section_type,eyebrow:text(b.eyebrow,120)||null,title:text(b.title,240)||null,body:text(b.body,3000)||null,primary_cta_label:text(b.primary_cta_label,80)||null,primary_cta_href,secondary_cta_label:text(b.secondary_cta_label,80)||null,secondary_cta_href,media_path:text(b.media_path,500)||null,theme,is_enabled:b.is_enabled!==false,sort_order,status,scheduled_publish_at}}
}

export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const{user}=await requireRole(['content_admin','marketing_admin'])
    const{id}=await params
    if(!/^[0-9a-f-]{36}$/i.test(id))return errorResponse('Invalid section ID.')
    if(!request.headers.get('content-type')?.toLowerCase().includes('application/json'))return errorResponse('JSON request required.',415)
    const parsed=parse(await request.json().catch(()=>null))
    if(!('data'in parsed))return errorResponse(parsed.error??'Invalid request.')
    const parsedData=parsed.data
    if(!parsedData)return errorResponse('Invalid landing-section payload.',500)
    const supabase=createAdminClient()
    if(parsedData.section_type==='hero'){
      const{count}=await supabase.from('landing_sections').select('id',{count:'exact',head:true}).eq('section_type','hero').neq('status','archived').neq('id',id)
      if((count??0)>=5)return errorResponse('Zorah supports a maximum of 5 hero slides.',409)
    }
    const{data:existing}=await supabase.from('landing_sections').select('id').eq('id',id).maybeSingle()
    if(!existing)return errorResponse('Landing section not found.',404)
    const{error}=await supabase.from('landing_sections').update({...parsedData,updated_by:user.id,published_at:parsedData.status==='published'?new Date().toISOString():null}).eq('id',id)
    if(error)return errorResponse(error.code==='23505'?'A section with this key already exists.':'Could not update section.',error.code==='23505'?409:400)
    revalidatePath('/')
    return NextResponse.json({ok:true})
  }catch(error){console.error('Landing CMS PUT failed',error);return errorResponse('Unable to update landing section.',500)}
}

export async function DELETE(_request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    await requireRole(['content_admin','marketing_admin'])
    const{id}=await params
    if(!/^[0-9a-f-]{36}$/i.test(id))return errorResponse('Invalid section ID.')
    const supabase=createAdminClient()
    const{error}=await supabase.from('landing_sections').delete().eq('id',id)
    if(error)return errorResponse('Could not delete section.',400)
    revalidatePath('/')
    return NextResponse.json({ok:true})
  }catch(error){console.error('Landing CMS DELETE failed',error);return errorResponse('Unable to delete landing section.',500)}
}
