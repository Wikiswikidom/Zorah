const rawBase = process.env.BASE_URL || "http://localhost:3000";
const base = rawBase.replace(/\/$/, "");
const bypassHeaders = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
  ? { "x-vercel-protection-bypass": process.env.VERCEL_AUTOMATION_BYPASS_SECRET }
  : {};
const pages = [
  { path: "/", marker: "Zorah Handbags", description: "root route resolves without a runtime error" },
  { path: "/landing", marker: "Carry your point of view", description: "landing page renders its primary message" },
  { path: "/shop", marker: "Shop handbags", description: "shop catalogue renders" },
  { path: "/collections", marker: "Categories", description: "collections page renders" },
  { path: "/cart", marker: "Cart", description: "cart page renders" },
  ...(process.env.PUBLISHED_PRODUCT_SLUG ? [{ path: `/products/${encodeURIComponent(process.env.PUBLISHED_PRODUCT_SLUG)}`, marker: process.env.PUBLISHED_PRODUCT_MARKER || process.env.PUBLISHED_PRODUCT_SLUG, description: "published product detail renders" }] : []),
  { path: "/products/aurelia", marker: "We couldn't find that page", description: "unpublished placeholder products stay hidden" },
  { path: "/terms-and-conditions", marker: "Terms", description: "terms page renders" },
];

const apiCases = [
  {
    method: "POST", path: "/api/checkout", body: { items: [] }, origin: base,
    expectedStatus: 401, description: "checkout rejects unauthenticated requests before creating orders",
  },
  {
    method: "GET", path: "/api/checkout/verify?reference=phase4-smoke-invalid",
    expectedStatus: 401, description: "payment verification requires the owning signed-in customer",
  },
  {
    method: "GET", path: "/api/customer/address",
    expectedStatus: 200, description: "address endpoint responds safely for a signed-out visitor",
  },
  {
    method: "POST", path: "/api/waitlist", body: { slug: "not a valid slug" }, origin: base,
    expectedStatus: 400, description: "same-origin waitlist request validates input without writing data",
  },
  {
    method: "POST", path: "/api/waitlist", body: { slug: "not a valid slug" }, origin: "https://attacker.invalid",
    expectedStatus: 403, description: "cross-origin waitlist request is blocked",
  },
];

let failed = 0;
let total = 0;
function record(pass, description, details = "") {
  total++;
  console.log(`${pass ? "PASS" : "FAIL"} ${description}${details ? ` -> ${details}` : ""}`);
  if (!pass) failed++;
}

async function request(path, init = {}) {
  return fetch(base + path, {
    cache: "no-store",
    redirect: "manual",
    ...init,
    headers: { ...bypassHeaders, ...(init.headers || {}) },
  });
}

if (!process.env.PUBLISHED_PRODUCT_SLUG) console.log("SKIP published product detail check: set PUBLISHED_PRODUCT_SLUG and PUBLISHED_PRODUCT_MARKER for the target database.");

for (const test of pages) {
  try {
    const response = await request(test.path);
    const body = await response.text();
    const pass = response.status === (test.expectedStatus ?? 200)
      && body.toLowerCase().includes(test.marker.toLowerCase())
      && !/application error|internal server error|unhandled runtime error/i.test(body);
    record(pass, test.description, `HTTP ${response.status}`);
  } catch (error) {
    record(false, test.description, error instanceof Error ? error.message : "request failed");
  }
}

for (const test of apiCases) {
  try {
    const response = await request(test.path, {
      method: test.method,
      headers: {
        ...(test.body ? { "content-type": "application/json" } : {}),
        ...(test.origin ? { origin: test.origin } : {}),
      },
      ...(test.body ? { body: JSON.stringify(test.body) } : {}),
    });
    const body = await response.text();
    const noSensitivePayload = !body.includes("service_role")
      && !/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(body)
      && !/\"(?:user_id|profiles|payments|orders|customers)\"\s*:/i.test(body);
    record(response.status === test.expectedStatus && noSensitivePayload, test.description, `HTTP ${response.status}`);

    if (test.path === "/api/customer/address" && response.ok) {
      let data;
      try { data = JSON.parse(body); } catch {}
      record(!!data && data.address === null && data.email === null,
        "signed-out address response contains no customer information");
    }
  } catch (error) {
    record(false, test.description, error instanceof Error ? error.message : "request failed");
  }
}

try {
  const response = await request("/robots.txt");
  const body = await response.text();
  record(response.status === 200 && body.includes("/sitemap.xml")
    && body.includes("/admin") && body.includes("/account") && body.includes("/api/"),
    "robots.txt publishes sitemap and excludes private routes", `HTTP ${response.status}`);
} catch (error) {
  record(false, "robots.txt publishes sitemap and excludes private routes", error instanceof Error ? error.message : "request failed");
}

try {
  const response = await request("/sitemap.xml");
  const body = await response.text();
  const isXml = response.status === 200 && /<urlset\b/i.test(body) && /<loc>https?:\/\//i.test(body);
  const hasExpectedPages = body.includes("/landing") && body.includes("/shop") && body.includes("/collections");
  const noLocalhost = !body.includes("localhost") && !body.includes("127.0.0.1");
  const noPrivatePaths = !/<loc>[^<]*\/(?:admin|account|checkout|api)(?:\/|<)/i.test(body);
  record(isXml && hasExpectedPages && noLocalhost && noPrivatePaths,
    "sitemap is valid, canonical-hosted, and contains public pages only", `HTTP ${response.status}`);
} catch (error) {
  record(false, "sitemap is valid, canonical-hosted, and contains public pages only", error instanceof Error ? error.message : "request failed");
}

try {
  const response = await request("/landing");
  const html = await response.text();
  const title = /<title>[^<]+<\/title>/i.test(html);
  const description = /<meta[^>]+name=["']description["'][^>]+content=["'][^"']+["']/i.test(html)
    || /<meta[^>]+content=["'][^"']+["'][^>]+name=["']description["']/i.test(html);
  const lang = /<html[^>]+lang=["']en["']/i.test(html);
  record(response.status === 200 && title && description && lang,
    "landing HTML has a title, meta description, and document language", `HTTP ${response.status}`);
  for (const [header, pattern] of [
    ["content-security-policy", /default-src 'self'/i],
    ["x-content-type-options", /^nosniff$/i],
    ["x-frame-options", /^DENY$/i],
    ["referrer-policy", /^strict-origin-when-cross-origin$/i],
    ["strict-transport-security", /max-age=/i],
    ["permissions-policy", /camera=\(\)/i],
  ]) {
    record(pattern.test(response.headers.get(header) || ""), `security header: ${header}`);
  }
} catch (error) {
  record(false, "landing metadata and security headers can be inspected", error instanceof Error ? error.message : "request failed");
}

if (failed) {
  console.error(`Phase 4 customer/platform smoke suite: ${failed} of ${total} checks failed.`);
  process.exit(1);
}
console.log(`Phase 4 customer/platform smoke suite passed: ${total} checks.`);
