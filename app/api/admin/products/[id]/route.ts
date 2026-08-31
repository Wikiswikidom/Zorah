import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createClient } from '@/lib/supabase/server'

const clean=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):''
const validId=(v:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
const validSlug=(v:string)=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)
const statuses=new Set(['draft','published','archived'])
const jsonError=(message:string,status:number)=>NextResponse.json({error:message},{status})

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const {user}=await requireRole(['catalog_admin']); const {id}=await params
    if(!validId(id))return jsonError('Invalid product identifier.',400)
    if(!request.headers.get('content-type')?.toLowerCase().includes('application/json'))return jsonError('JSON request required.',415)
    let body:unknown; try{body=await request.json()}catch{return jsonError('Invalid JSON request.',400)}
    if(!body||typeof body!=='object'||Array.isArray(body))return jsonError('Invalid request.',400)
    const b=body as Record<string,unknown>, name=clean(b.name,160),slug=clean(b.slug,120),price=typeof b.base_price==='number'?b.base_price:Number(b.base_price)
    if(name.length<2||!validSlug(slug)||!Number.isFinite(price)||price<0||price>1000000000)return jsonError('Please check the product name, slug and NGN price.',400)
    const status=typeof b.status==='string'&&statuses.has(b.status)?b.status:'draft'
    const keywords=Array.isArray(b.seo_keywords)?b.seo_keywords.filter((x):x is string=>typeof x==='string').map(x=>x.trim().slice(0,80)).filter(Boolean).slice(0,20):[]
    const supabase=await createClient(); const {data,error}=await supabase.from('products').update({name,slug,short_description:clean(b.short_description,500),description:clean(b.description,10000),base_price:price,status,is_featured:b.is_featured===true,badge:clean(b.badge,40)||null,seo_title:clean(b.seo_title,70)||null,seo_description:clean(b.seo_description,170)||null,seo_keywords:keywords,updated_by:user.id}).eq('id',id).select('id').single()
    if(error)return jsonError(error.code==='23505'?'A product with this slug already exists.':'Could not update product.',error.code==='23505'?409:400)
    return NextResponse.json({id:data.id})
  }catch{return jsonError('Unable to update product.',500)}
}
