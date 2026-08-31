import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createClient } from '@/lib/supabase/server'

const clean=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):''
const validSlug=(v:string)=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)
const statuses=new Set(['draft','published','archived'])

function payload(body:Record<string,unknown>){
  const name=clean(body.name,160), slug=clean(body.slug,120), short_description=clean(body.short_description,500), description=clean(body.description,10000)
  const price=typeof body.base_price==='number'?body.base_price:Number(body.base_price)
  if(name.length<2||!validSlug(slug)||!Number.isFinite(price)||price<0||price>1000000000) return {error:'Invalid product details.'}
  const status=typeof body.status==='string'&&statuses.has(body.status)?body.status:'draft'
  const keywords=Array.isArray(body.seo_keywords)?body.seo_keywords.filter((x):x is string=>typeof x==='string').map(x=>x.trim().slice(0,80)).filter(Boolean).slice(0,20):[]
  return {data:{name,slug,short_description,description,base_price:price,currency:'NGN',status,is_featured:body.is_featured===true,badge:clean(body.badge,40)||null,seo_title:clean(body.seo_title,70)||null,seo_description:clean(body.seo_description,170)||null,seo_keywords:keywords}}
}

export async function POST(request:Request){
  try{ const {user}=await requireRole(['catalog_admin']); const body=await request.json(); if(!body||typeof body!=='object')return NextResponse.json({error:'Invalid request.'},{status:400}); const parsed=payload(body as Record<string,unknown>); if('error'in parsed)return NextResponse.json(parsed,{status:400}); const supabase=await createClient(); const {data,error}=await supabase.from('products').insert({...parsed.data,created_by:user.id,updated_by:user.id}).select('id').single(); if(error){const status=error.code==='23505'?409:400;return NextResponse.json({error:error.code==='23505'?'A product with this slug already exists.':'Could not create product.'},{status})} return NextResponse.json({id:data.id},{status:201}) }catch{return NextResponse.json({error:'Unable to create product.'},{status:500})}
}
