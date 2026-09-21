const base=(process.env.SECURITY_BASE_URL||'https://zorah-eight.vercel.app').replace(/\/$/,'')
const checks=[
  ['/','public page',200],
  ['/shop','shop page',200],
  ['/journal','journal page',200],
  ['/robots.txt','robots',200],
  ['/sitemap.xml','sitemap',200],
  ['/api/admin/campaigns','admin API without auth',401],
  ['/api/admin/orders','orders API without auth',401],
  ['/.env','environment file',404],
  ['/.git/config','git metadata',404],
]
let failed=0
for(const [path,label,expected] of checks){
  const response=await fetch(base+path,{redirect:'manual'})
  const ok=response.status===expected
  console.log(`${ok?'PASS':'FAIL'} ${label}: ${response.status} (expected ${expected})`)
  if(!ok) failed++
}
const headerResponse=await fetch(base+'/',{redirect:'manual'})
const requiredHeaders=[
  'content-security-policy',
  'strict-transport-security',
  'x-content-type-options',
  'x-frame-options',
  'referrer-policy',
  'cross-origin-opener-policy',
]
for(const name of requiredHeaders){
  const ok=Boolean(headerResponse.headers.get(name))
  console.log(`${ok?'PASS':'FAIL'} security header: ${name}`)
  if(!ok) failed++
}
if(failed){console.error(`Security smoke failed: ${failed} check(s).`);process.exit(1)}
console.log('Security smoke passed.')
