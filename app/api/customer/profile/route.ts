import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(){
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  if(!user)return NextResponse.json({error:'Unauthorized'},{status:401})
  const {data:profile,error}=await supabase.from('profiles').select('full_name,phone').eq('id',user.id).maybeSingle()
  if(error)return NextResponse.json({error:'Could not load profile'},{status:500})
  return NextResponse.json({profile:profile||{full_name:user.user_metadata?.full_name||'',phone:user.user_metadata?.phone||''},email:user.email||''})
}

export async function PUT(request:Request){
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  if(!user)return NextResponse.json({error:'Unauthorized'},{status:401})
  const body=await request.json().catch(()=>null)
  const full_name=typeof body?.full_name==='string'?body.full_name.trim().slice(0,120):''
  const phone=typeof body?.phone==='string'?body.phone.trim().slice(0,30):''
  if(!full_name)return NextResponse.json({error:'Full name is required'},{status:400})
  try{
    const admin=createAdminClient()
    const {data:profile,error}=await admin.from('profiles').upsert({id:user.id,full_name,phone},{onConflict:'id'}).select('full_name,phone').single()
    if(error)throw error
    return NextResponse.json({profile,email:user.email||''})
  }catch(error){
    console.error('Profile update failed',error)
    return NextResponse.json({error:'Could not save profile details'},{status:500})
  }
}
