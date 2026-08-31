import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createClient } from '@/lib/supabase/server'

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const ALLOWED=new Set(['draft','published','archived'])

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  const {user}=await requireRole(['catalog_admin']); const {id}=await params
  if(!UUID.test(id))return NextResponse.json({error:'Invalid product.'},{status:400})
  const body=await request.json().catch(()=>null)
  const status=body?.status
  if(typeof status!=='string'||!ALLOWED.has(status))return NextResponse.json({error:'Invalid publishing status.'},{status:400})
  const scheduled=body?.scheduled_publish_at
  if(scheduled!==null&&scheduled!==undefined&&typeof scheduled!=='string')return NextResponse.json({error:'Invalid schedule.'},{status:400})
  const when=scheduled?new Date(scheduled):null
  if(when&&Number.isNaN(when.getTime()))return NextResponse.json({error:'Invalid schedule date.'},{status:400})
  if(status==='published'&&when&&when.getTime()<=Date.now())return NextResponse.json({error:'A publish schedule must be in the future.'},{status:400})
  const supabase=await createClient()
  const {data:existing,error:findError}=await supabase.from('products').select('id,status').eq('id',id).single()
  if(findError||!existing)return NextResponse.json({error:'Product not found.'},{status:404})
  const now=new Date().toISOString()
  const update:Record<string,unknown>={status,updated_by:user.id,updated_at:now}
  if(status==='published'&&!when){update.published_at=now;update.scheduled_publish_at=null;update.unpublished_at=null}
  else if(status==='draft'){update.scheduled_publish_at=when?.toISOString()??null;update.unpublished_at=now}
  else if(status==='archived'){update.scheduled_publish_at=null;update.unpublished_at=now}
  else if(when){update.scheduled_publish_at=when.toISOString();update.published_at=null;update.unpublished_at=null}
  const {data,error}=await supabase.from('products').update(update).eq('id',id).select('id,status,published_at,scheduled_publish_at,unpublished_at').single()
  if(error)return NextResponse.json({error:'Could not update publishing status.'},{status:400})
  return NextResponse.json({product:data})
}
