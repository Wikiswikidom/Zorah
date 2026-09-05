import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX = 5 * 1024 * 1024
const BUCKET = 'brand-assets'
const ALLOWED = new Set(['image/png','image/jpeg','image/jpg','image/webp','image/svg+xml','image/x-icon','image/vnd.microsoft.icon','image/avif'])
const EXTENSIONS: Record<string,string> = { png:'png', jpg:'jpg', jpeg:'jpg', webp:'webp', svg:'svg', ico:'ico', avif:'avif' }

const errorResponse = (message:string,status=400) => NextResponse.json({error:message},{status})

async function detectType(file:File){
  const bytes = new Uint8Array(await file.slice(0,512).arrayBuffer())
  const starts = (values:number[]) => values.every((value,index) => bytes[index] === value)
  if(starts([0xff,0xd8,0xff])) return 'image/jpeg'
  if(starts([137,80,78,71,13,10,26,10])) return 'image/png'
  if(String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP') return 'image/webp'
  if(String.fromCharCode(...bytes.slice(4,8))==='ftyp') return 'image/avif'
  if(bytes[0]===0&&bytes[1]===0&&(bytes[2]===1||bytes[2]===2)&&bytes[3]===0)return 'image/x-icon'
  const text = new TextDecoder().decode(bytes).replace(/^\uFEFF/,'').trimStart()
  if(text.includes('<svg')){
    const lower=text.toLowerCase()
    if(/<script\b|javascript:|on[a-z]+\s*=/.test(lower))return null
    return 'image/svg+xml'
  }
  return null
}

export async function POST(request:Request){
  try{
    await requireRole(['content_admin','marketing_admin'])
    const form=await request.formData(),file=form.get('file'),kind=form.get('kind')
    if(!(file instanceof File))return errorResponse('Choose a logo or favicon file first.')
    if(kind!=='logo'&&kind!=='favicon')return errorResponse('Invalid branding asset type.')
    if(file.size<1||file.size>MAX)return errorResponse('Brand artwork must be between 1 byte and 5 MiB.')
    const type=await detectType(file)
    if(!type||(!ALLOWED.has(file.type)&&!ALLOWED.has(type)))return errorResponse('Unsupported or invalid image. Use PNG, JPG, JPEG, WebP, SVG, AVIF or ICO.')
    const extension=type==='image/jpeg'?'jpg':type==='image/x-icon'?'ico':EXTENSIONS[type.split('/')[1]]||type.split('/')[1]
    const path=`branding/${kind}-${crypto.randomUUID()}.${extension}`
    const supabase=createAdminClient()
    const upload=await supabase.storage.from(BUCKET).upload(path,file,{contentType:type,upsert:false,cacheControl:'31536000'})
    if(upload.error){console.error('Brand asset storage upload failed',upload.error);return errorResponse('Could not upload brand artwork. Check the brand-assets storage bucket.',500)}
    const {data}=supabase.storage.from(BUCKET).getPublicUrl(path)
    return NextResponse.json({path,url:data.publicUrl},{status:201})
  }catch(error){
    console.error('Brand asset upload failed',error)
    return errorResponse(error instanceof Error?error.message:'Unable to upload brand artwork.',500)
  }
}
