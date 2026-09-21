type Bucket={count:number;resetAt:number}
const buckets=new Map<string,Bucket>()
const MAX_BUCKETS=5000
export function rateLimit(key:string,limit:number,windowMs:number){
 const now=Date.now()
 const current=buckets.get(key)
 if(!current||current.resetAt<=now){
   if(buckets.size>=MAX_BUCKETS){const first=buckets.keys().next().value;if(first)buckets.delete(first)}
   const next={count:1,resetAt:now+windowMs}
   buckets.set(key,next)
   return{allowed:true,retryAfter:0}
 }
 current.count+=1
 if(current.count>limit)return{allowed:false,retryAfter:Math.max(1,Math.ceil((current.resetAt-now)/1000))}
 return{allowed:true,retryAfter:0}
}
export function requestIp(request:Request){
 const forwarded=request.headers.get('x-forwarded-for')
 return forwarded?.split(',')[0]?.trim()||request.headers.get('x-real-ip')||'unknown'
}
