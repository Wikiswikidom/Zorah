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
    description: \`unauthenticated admin route is hidden: \${path}\`,
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
];

let failed = 0;
for (const test of cases) {
  const response = await fetch(base + test.path, {
    method: test.method,
    redirect: "manual",
    cache: "no-store",
    headers: test.body ? { "content-type": "application/json" } : undefined,
    body: test.body,
  });
  const body = await response.text();
  const cacheControl = response.headers.get("cache-control") || "";
  const statusOk = response.status === test.expectedStatus;
  const privateOk = /private|no-store/i.test(cacheControl);
  const noSensitivePayload = !/\b(customer email|order total|service_role|secret key)\b/i.test(body);
  const pass = statusOk && privateOk && noSensitivePayload;
  console.log(\`\${pass ? "PASS" : "FAIL"} \${test.description} -> HTTP \${response.status}\`);
  if (!pass) {
    console.error(\`  expected HTTP \${test.expectedStatus}, private/no-store cache headers, and no sensitive payload\`);
    failed++;
  }
}
if (failed) process.exit(1);
console.log(\`Phase 3 unauthenticated security smoke passed: \${cases.length} cases\`);
