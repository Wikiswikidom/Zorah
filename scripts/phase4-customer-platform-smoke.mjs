const rawBase = process.env.BASE_URL || "http://localhost:3000";
const base = rawBase.replace(/\\/$/, "");
const pages = [
  { path: "/", marker: "Carry your point of view", description: "root resolves to the public landing experience" },
  { path: "/landing", marker: "Carry your point of view", description: "landing page renders its primary message" },
  { path: "/shop", marker: "Shop handbags", description: "shop catalogue renders" },
  { path: "/collections", marker: "Categories", description: "collections page renders" },
  { path: "/cart", marker: "Cart", description: "cart page renders" },
  { path: "/products/zorah-watch", marker: "Zorah Watch", description: "published product detail renders" },
  { path: "/terms-and-conditions", marker: "Terms", description: "terms page renders" },
];

const apiCases = [
  {
    method: "POST",
    path: "/api/checkout",
    body: { items: [] },
    expectedStatus: 401,
    description: "checkout rejects unauthenticated requests before creating orders",
  },
  {
    method: "GET",
    path: "/api/checkout/verify?reference=phase4-smoke-invalid",
    expectedStatus: 401,
    description: "payment verification requires the owning signed-in customer",
  },
  {
    method: "GET",
    path: "/api/customer/address",
    expectedStatus: 200,
    description: "address endpoint responds safely for a signed-out visitor",
  },
  {
    method: "POST",
    path: "/api/waitlist",
    body: { slug: "not a valid slug" },
    origin: base,
    expectedStatus: 400,
    description: "same-origin waitlist request validates input without writing data",
  },
  {
    method: "POST",
    path: "/api/waitlist",
    body: { slug: "not a valid slug" },
    origin: "https://attacker.invalid",
    expectedStatus: 403,
    description: "cross-origin waitlist request is blocked",
  },
];

let failed = 0;
async function runPage(test) {
  try {
    const response = await fetch(base + test.path, { cache: "no-store" });
    const body = await response.text();
    const pass = response.status === 200 && body.toLowerCase().includes(test.marker.toLowerCase()) &&
      !/application error|internal server error|unhandled runtime error/i.test(body);
    console.log(`${pass ? "PASS" : "FAIL"} ${test.description} -> HTTP ${response.status}`);
    if (!pass) {
      console.error(`  expected HTTP 200 and visible marker: ${test.marker}`);
      failed++;
    }
  } catch (error) {
    console.log(`FAIL ${test.description} -> ${error instanceof Error ? error.message : "request failed"}`);
    failed++;
  }
}

async function runApi(test) {
  try {
    const response = await fetch(base + test.path, {
      method: test.method,
      redirect: "manual",
      cache: "no-store",
      headers: {
        ...(test.body ? { "content-type": "application/json" } : {}),
        ...(test.origin ? { origin: test.origin } : {}),
      },
      ...(test.body ? { body: JSON.stringify(test.body) } : {}),
    });
    const body = await response.text();
    const pass = response.status === test.expectedStatus &&
      !body.includes("service_role") &&
      !/"(?:email|user_id|profiles|payments|orders|customers)"\\s*:/i.test(body);
    console.log(`${pass ? "PASS" : "FAIL"} ${test.description} -> HTTP ${response.status}`);
    if (!pass) {
      console.error(`  expected HTTP ${test.expectedStatus}, no sensitive payload`);
      failed++;
    }
    if (test.path === "/api/customer/address" && response.ok) {
      try {
        const data = JSON.parse(body);
        if (data.address !== null || data.email !== null) {
          console.error("  expected null address/email for signed-out visitor");
          failed++;
        }
      } catch {
        console.error("  expected a JSON address response");
        failed++;
      }
    }
  } catch (error) {
    console.log(`FAIL ${test.description} -> ${error instanceof Error ? error.message : "request failed"}`);
    failed++;
  }
}

for (const test of pages) await runPage(test);
for (const test of apiCases) await runApi(test);

const total = pages.length + apiCases.length;
if (failed) {
  console.error(`Phase 4 smoke suite: ${failed} of ${total} checks failed.`);
  process.exit(1);
}
console.log(`Phase 4 customer/platform smoke suite passed: ${total} checks.`);
