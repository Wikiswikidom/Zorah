import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createAdminClient } from '@/lib/supabase/admin'

const TYPES=new Set(['image/jpeg','image/png','image/webp','image/avif'])
const MAX=10*1024*1024
const BUCKET='landing-media'
async function validSignature(file:File){const b=new Uint8Array(await file.slice(0,16).arrayBuffer());if(file.type==='image/jpeg')return b[0]===0xff&&b[1]===0xd8&&b[2]===0xff;if(file.type==='image/png')return b.slice(0,8).every((x,i)=>x===[137,80,78,71,13,10,26,10][i]);if(file.type==='image/webp')return String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP';if(file.type==='image/avif')return String.fromCharCode(...b.slice(4,8))==='ftyp';return false}

export async function POST(request:Request){
  try{
    await requireRole(['content_admin','marketing_admin'])
    const file=(await request.formData()).get('file')
    if(!(file instanceof File))return NextResponse.json({error:'Image file is required.'},{status:400})
    if(file.size<1||file.size>MAX)return NextResponse.json({error:'Image must be between 1 byte and 10 MiB.'},{status:400})
    if(!TYPES.has(file.type)||!(await validSignature(file)))return NextResponse.json({error:'Invalid or unsupported image file.'},{status:400})
    const ext=file.type==='image/jpeg'?'jpg':file.type.split('/')[1]
    const path=`landing/${crypto.randomUUID()}.${ext}`
    const s=createAdminClient()
    const upload=await s.storage.from(BUCKET).upload(path,file,{contentType:file.type,upsert:false,cacheControl:'31536000'})
    if(upload.error){console.error('Landing media storage upload failed',upload.error);return NextResponse.json({error:'Could not upload landing image.'},{status:500})}
    const{data}=s.storage.from(BUCKET).getPublicUrl(path)
    return NextResponse.json({path,url:data.publicUrl},{status:201})
  }catch(error){console.error('Landing media upload failed',error);return NextResponse.json({error:'Unable to upload landing image.'},{status:500})}
}
