# Zorah — Phase 2D-6 + 2D-8 Completion Record

## Scope completed

### 2D-6 — Ads, Campaigns & Flash Sales
- Campaign CRUD with server-side validation and role authorization.
- Campaign types: announcement, hero, banner, flash sale, product promotion, collection promotion and editorial.
- Landing/shop/both placement controls.
- Priority ordering.
- Start/end windows and live-window checks.
- Countdown presentation for campaigns with an end time.
- Percentage/fixed-amount promotion metadata with percentage capped at 100.
- Internal-only CTA paths; arbitrary external protocols/HTML/JavaScript are rejected.
- Product and collection targeting with bounded lists and relationship validation.
- Public landing and shop campaign presentation.
- Campaign data is merchandising metadata only; checkout/payment code must independently calculate and verify final prices in later payment phases.

### 2D-8 — Merchandising
- Secure merchandising placement CRUD.
- Published-product requirement.
- Slot keys, titles, descriptions and ordering.
- Enable/disable state.
- Availability windows.
- Admin UI for creating, editing and deleting placements.
- Storefront merchandising rail for active placements.
- Customer-visible placements remain limited to enabled, in-window, published products.

## Security decisions

- Browser input is never trusted as authorization.
- Admin mutations pass through Next.js authorization and Supabase RLS.
- Campaign/merchandising target IDs are validated and bounded.
- Product/collection targets must exist.
- Campaign CTA values are restricted to internal paths.
- No arbitrary CMS HTML/JavaScript is accepted.
- Supabase service-role/secret credentials must remain server-side.
- Public reads expose only active campaign/merchandising data allowed by RLS.
- Customer authentication does not grant administrative permissions.

## Database security verification

The Zorah Supabase Security Advisor was rechecked after the policy changes: **0 security lints**.

RLS policy overlap was also reduced for campaign and merchandising tables. Performance advisor output may still contain informational unused-index/foreign-key recommendations elsewhere in the project; these are optimization items, not security findings.

## Deliberate phase boundaries

- Automatic scheduled publishing remains 2D-9. A browser timer is not treated as a trusted scheduler.
- Final promotional-price enforcement belongs to the payment/checkout backend and must never trust campaign data supplied by a customer browser.
- Production deployment/build verification is performed after the Vercel preview environment is connected.

## QA gate

The implementation has been reviewed for authorization boundaries, input validation, RLS policy design and storefront visibility. The repository's automated quality workflow remains the authoritative TypeScript/build/dependency gate when a workflow run is available.

Do not mark production-ready solely because the admin UI renders; run the complete build and integration/security test suite before launch.
