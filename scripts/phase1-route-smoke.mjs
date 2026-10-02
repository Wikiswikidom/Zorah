const base = (process.env.BASE_URL || 'https://zorah-eight.vercel.app').replace(/\/$/, '')

const cases = [
  ['/admin-login-zorah', 200, 'Run the house'],
  ['/admin-login', 404, "We couldn't find that page."],
  ['/admin-login/', 404, "We couldn't find that page."],
  ['/admins', 404, "We couldn't find that page."],
  ['/admin', 404, "We couldn't find that page."],
  ['/admin/random', 404, "We couldn't find that page."],
  ['/admin/database', 404, "We couldn't find that page."],
  ['/admin-login-zorah-something', 404, "We couldn't find that page."],
  ['/shop', 200, 'Shop handbags'],
  ['/login', 200, 'Welcome back'],
]

let failed = 0
for (const [path, expectedStatus, expectedText] of cases) {
  const response = await fetch(base + path, { redirect: 'manual' })
  const body = await response.text()
  const statusOk = response.status === expectedStatus
  const textOk = body.includes(expectedText)
  console.log(`${statusOk && textOk ? 'PASS' : 'FAIL'} ${path} -> ${response.status}`)
  if (!statusOk || !textOk) {
    console.error(`  expected status ${expectedStatus} and body containing: ${expectedText}`)
    failed++
  }
}

if (failed) process.exit(1)
console.log(`Phase 1 route smoke passed: ${cases.length} cases`)
