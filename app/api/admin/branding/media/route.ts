import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX=5*1024*1024
const BUCKET='brand-assets'
const TYPES=new Set(['image/png','image/jpeg','image/webp','image/svg+xml','image/x-icon','image/vnd.microsoft.icon'])
const EXT_TYPES:Record<string,string>={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',svg:'image/svg+xml',ico:'image/x-icon'}
const jsonError=(message:string,status=400)=>NextResponse.json({error:message},{status})
function detectedType(file:File){const ext=file.name.toLowerCase().split('.').pop()||'';return TYPES.has(file.type)?file.type:EXT_TYPES[ext]||''}
async function validSignature(file:File,type:string){
 const bytes=new Uint8Array(await file.slice(0,64).arrayBuffer())
 const starts=(values:number[])=>values.every((value,index)=>bytes[index]===value)
 if(type==='image/jpeg')return starts([0xff,0xd8,0xff])
 if(type==='image/png')return starts([137,80,78,71,13,10,26,10])
 if(type==='image/webp')return String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP'
 if(type==='image/x-icon'||type==='image/vnd.microsoft.icon')return bytes[0]===0&&bytes[1]===0&&(bytes[2]===1||bytes[2]===2)&&bytes[3]===0
 if(type==='image/svg+xml'){const head=new TextDecoder().decode(bytes).replace(/^\uFEFF/,'').trimStart().toLowerCase();return head.startsWith('<svg')||head.startsWith('<?xml')}
 return false
}
export async function POST(request:Request){
 try{
  await requireRole(['content_admin','marketing_admin'])
  const form=await request.formData(),file=form.get('file'),kind=form.get('kind')
  if(!(file instanceof File))return jsonError('Image file is required.')
  if(kind!=='logo'&&kind!=='favicon')return jsonError('Invalid branding asset type.')
  if(file.size<1||file.size>MAX)return jsonError('Brand artwork must be between 1 byte and 5 MiB.')
  const type=detectedType(file)
  if(!TYPES.has(type)||!(await validSignature(file,type)))return jsonError('Unsupported or invalid image format.')
  const extension=type==='image/jpeg'?'jpg':type==='image/svg+xml'?'svg':type.includes('icon')?'ico':type.split('/')[1]
  const path=`branding/${kind}-${crypto.randomUUID()}.${extension}`
  const supabase=createAdminClient()
  const upload=await supabase.storage.from(BUCKET).upload(path,file,{contentType:type,upsert:false,cacheControl:'31536000'})
  if(upload.error){console.error('Brand asset storage upload failed',upload.error);return jsonError('Could not upload brand artwork.',500)}
  const{data}=supabase.storage.from(BUCKET).getPublicUrl(path)
  return NextResponse.json({path,url:data.publicUrl},{status:201})
 }catch(error){console.error('Brand asset upload failed',error);return jsonError('Unable to upload brand artwork.',500)}
}
