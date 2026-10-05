const rawBase = process.env.BASE_URL;
if (!rawBase) {
  console.error("Set BASE_URL to the exact Phase 3 Vercel preview URL before running this test.");
  process.exit(2);
}

const base = rawBase.replace(/\/$/, "");
const privatePaths = [
  "/admin",
  "/admin/products",
  "/admin/orders",
  "/admin/customers",
  "/admin/team",
  "/admin/security",
  "/admin/audit",
  "/admin/waitlist",
];
const cases = [
  ...privatePaths.map((path) => ({
    method: "GET",
    path,
    expectedStatus: 404,
    description: `unauthenticated admin route is hidden: ${path}`,
  })),
  {
    method: "GET",
    path: "/api/admin/search?q=customer",
    expectedStatus: 401,
    description: "unauthenticated admin search is denied",
  },
  {
    method: "POST",
    path: "/api/paystack/webhook",
    expectedStatus: 401,
    body: JSON.stringify({ event: "charge.success", data: { reference: "phase3-invalid-signature" } }),
    description: "unsigned payment webhook is rejected",
  },
  {
    method: "POST",
    path: "/api/paystack/webhook",
    expectedStatus: 413,
    body: "x".repeat(1_000_001),
    description: "oversized payment webhook is rejected before parsing",
  },
  {
    method: "POST",
    path: "/api/waitlist",
    expectedStatus: 400,
    origin: base,
    body: JSON.stringify({ slug: "not a valid slug" }),
    description: "same-origin state-changing request reaches input validation",
  },
  {
    method: "POST",
    path: "/api/waitlist",
    expectedStatus: 403,
    origin: "https://attacker.invalid",
    body: JSON.stringify({ slug: "not a valid slug" }),
    description: "cross-origin state-changing request is rejected",
  },
];

let failed = 0;
for (const test of cases) {
  const response = await fetch(base + test.path, {
    method: test.method,
    redirect: "manual",
    cache: "no-store",
    headers: test.body ? { "content-type": "application/json", ...(test.origin ? { origin: test.origin } : {}) } : undefined,
    body: test.body,
  });
  const body = await response.text();
  const cacheControl = response.headers.get("cache-control") || "";
  const statusOk = response.status === test.expectedStatus;
  const privateOk = /private|no-store/i.test(cacheControl);
  const leaksStructuredData = /"(?:results|orders|customers|profiles|payments|email|total|user_id)"\s*:/i.test(body);
  const leaksEmailAddress = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(body);
  const noSensitivePayload = !leaksStructuredData && !leaksEmailAddress && !body.includes("service_role");
  const pass = statusOk && privateOk && noSensitivePayload;
  console.log(`${pass ? "PASS" : "FAIL"} ${test.description} -> HTTP ${response.status}`);
  if (!pass) {
    console.error(`  expected HTTP ${test.expectedStatus}, private/no-store cache headers, and no sensitive payload`);
    failed++;
  }
}
if (failed) process.exit(1);
console.log(`Phase 3 unauthenticated security smoke passed: ${cases.length} cases`);
