import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createClient } from '@/lib/supabase/server'

const clean=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):''
const validId=(v:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
const validSlug=(v:string)=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)
const statuses=new Set(['draft','published','archived'])

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const {user}=await requireRole(['catalog_admin']); const {id}=await params
    if(!validId(id))return NextResponse.json({error:'Invalid product identifier.'},{status:400})
    const body=await request.json(); if(!body||typeof body!=='object')return NextResponse.json({error:'Invalid request.'},{status:400})
    const b=body as Record<string,unknown>, name=clean(b.name,160),slug=clean(b.slug,120),price=typeof b.base_price==='number'?b.base_price:Number(b.base_price)
    if(name.length<2||!validSlug(slug)||!Number.isFinite(price)||price<0||price>1000000000)return NextResponse.json({error:'Invalid product details.'},{status:400})
    const status=typeof b.status==='string'&&statuses.has(b.status)?b.status:'draft'
    const keywords=Array.isArray(b.seo_keywords)?b.seo_keywords.filter((x):x is string=>typeof x==='string').map(x=>x.trim().slice(0,80)).filter(Boolean).slice(0,20):[]
    const supabase=await createClient(); const {data,error}=await supabase.from('products').update({name,slug,short_description:clean(b.short_description,500),description:clean(b.description,10000),base_price:price,status,is_featured:b.is_featured===true,badge:clean(b.badge,40)||null,seo_title:clean(b.seo_title,70)||null,seo_description:clean(b.seo_description,170)||null,seo_keywords:keywords,updated_by:user.id}).eq('id',id).select('id').single()
    if(error)return NextResponse.json({error:error.code==='23505'?'A product with this slug already exists.':'Could not update product.'},{status:error.code==='23505'?409:400})
    return NextResponse.json({id:data.id})
  }catch{return NextResponse.json({error:'Unable to update product.'},{status:500})}
}
