const rawBase = process.env.BASE_URL;
if (!rawBase) {
  console.error("Set BASE_URL to the exact Phase 2 Vercel preview URL before running this test.");
  process.exit(2);
}
const base = rawBase.replace(/\/$/, "");
const cases = [
  {
    path: "/api/admin/search?q=bag",
    expectedStatus: 401,
    description: "unauthenticated global search is denied",
  },
];

let failed = 0;
for (const test of cases) {
  const response = await fetch(base + test.path, { redirect: "manual", cache: "no-store" });
  const body = await response.text();
  const cacheControl = response.headers.get("cache-control") || "";
  const statusOk = response.status === test.expectedStatus;
  const privateResponse = /private|no-store/i.test(cacheControl);
  const noDataLeak = !body.includes('"results"') && !body.includes('"orders"') && !body.includes('"customers"');
  const pass = statusOk && privateResponse && noDataLeak;
  console.log(`${pass ? "PASS" : "FAIL"} ${test.description} -> HTTP ${response.status}`);
  if (!pass) {
    console.error(`  expected HTTP ${test.expectedStatus}, private/no-store cache, and no search results in the body`);
    failed++;
  }
}
if (failed) process.exit(1);
console.log(`Phase 2 search smoke passed: ${cases.length} security case`);
