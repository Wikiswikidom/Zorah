import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createClient } from '@/lib/supabase/server'

const TYPES=new Set(['image/jpeg','image/png','image/webp','image/avif'])
const EXT_TYPES=new Map([['jpg','image/jpeg'],['jpeg','image/jpeg'],['png','image/png'],['webp','image/webp'],['avif','image/avif']])
const MAX=10*1024*1024
const BUCKET='landing-media'

function detectedType(file:File){
  const ext=file.name.toLowerCase().split('.').pop()||''
  return EXT_TYPES.get(ext)||file.type
}

async function validSignature(file:File,type:string){
  const b=new Uint8Array(await file.slice(0,16).arrayBuffer())
  if(type==='image/jpeg')return b[0]===0xff&&b[1]===0xd8&&b[2]===0xff
  if(type==='image/png')return b.slice(0,8).every((x,i)=>x===[137,80,78,71,13,10,26,10][i])
  if(type==='image/webp')return String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP'
  if(type==='image/avif')return String.fromCharCode(...b.slice(4,8))==='ftyp'
  return false
}

export async function POST(request:Request){
  try{
    await requireRole(['content_admin','marketing_admin'])
    const file=(await request.formData()).get('file')
    if(!(file instanceof File))return NextResponse.json({error:'Image file is required.'},{status:400})
    if(file.size<1||file.size>MAX)return NextResponse.json({error:'Image must be between 1 byte and 10 MiB.'},{status:400})
    const type=detectedType(file)
    if(!TYPES.has(type)||!(await validSignature(file,type)))return NextResponse.json({error:'Invalid or unsupported image file. Use JPG, PNG, WebP or AVIF.'},{status:400})
    const ext=type==='image/jpeg'?'jpg':type.split('/')[1]
    const path=`landing/${crypto.randomUUID()}.${ext}`
    const supabase=await createClient()
    const upload=await supabase.storage.from(BUCKET).upload(path,file,{contentType:type,upsert:false,cacheControl:'31536000'})
    if(upload.error){console.error('Landing media storage upload failed',upload.error);return NextResponse.json({error:'Could not upload landing image. Check your CMS storage permissions.'},{status:500})}
    const{data}=supabase.storage.from(BUCKET).getPublicUrl(path)
    return NextResponse.json({path,url:data.publicUrl},{status:201})
  }catch(error){console.error('Landing media upload failed',error);return NextResponse.json({error:error instanceof Error?error.message:'Unable to upload landing image.'},{status:500})}
}
