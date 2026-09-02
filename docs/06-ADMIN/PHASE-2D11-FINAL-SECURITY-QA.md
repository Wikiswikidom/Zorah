# Phase 2D-11 — Final Admin Security & QA

## Purpose
Close Phase 2D only after implementation, database security, authorization, strict TypeScript, production build, dependency audit, and deployed browser/mobile verification are all green.

## Verification matrix
- 2D-1 Admin foundation: routes, navigation, responsive shell, unauthorized access blocked.
- 2D-2 Auth/RBAC: authenticated staff only; role restrictions; inactive/customer users denied.
- 2D-3 Products: CRUD, variants, media, publishing, SEO, validation, secure storage access.
- 2D-4 Collections/inventory: CRUD, assignments, variant stock movements, non-negative stock, actor tracking.
- 2D-5 Landing CMS: controlled section types, ordering, scheduling, enabled state, internal-only CTA paths.
- 2D-6 Campaigns: CRUD, targeting, placement, priority, date windows, countdown metadata, safe CTA validation.
- 2D-7 Journal/news: CRUD, statuses, scheduling, SEO, published-only public reads.
- 2D-8 Merchandising: placements, ordering, availability, enabled state, published-product requirement.
- 2D-9 Scheduling: database-time processing, retries, campaign expiry, no browser dependency, job history.
- 2D-10 Audit: database audit records, actor/role, before/after metadata, protected read/write access.

## Security gates
- Supabase Security Advisor: 0 security lints.
- RLS enabled on every staff/customer-sensitive table.
- No service/secret keys in browser code.
- No sensitive customer/payment data in localStorage.
- Admin authorization enforced server-side.
- User-controlled CTA URLs restricted to internal paths.
- Upload validation and private media access enforced server-side.
- Audit logs cannot be directly modified by normal clients.

## Build gates
- `npx tsc --noEmit` must pass.
- `npm run build` must pass.
- Dependency audit must be reviewed; high/critical unresolved vulnerabilities block release.
- CI must be green on the final commit.

## Browser/mobile gates
After Vercel preview is connected:
- Test public home/shop/product/journal flows.
- Test cart/wishlist/recently viewed behavior.
- Test login/logout and customer/admin separation.
- Test every admin workspace on mobile and desktop.
- Test scheduling with a short future timestamp and confirm automatic transition.
- Test audit record creation after representative admin mutations.
- Confirm no sensitive values appear in browser storage or client bundles.
- Confirm responsive navigation, drawers, forms, tables and destructive-action confirmations.

## Release rule
Phase 2D is not marked production-verified until CI and the Vercel preview/browser QA gates pass. Implementation completion alone is not sufficient.
