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
- Homepage merchandising placement integration.
- Customer-visible placements remain limited to enabled, in-window, published products.

## 2026-09-02 verification pass

- Re-verified the dedicated Zorah Supabase project and its public catalogue/content tables.
- Confirmed RLS is enabled on the relevant commerce, campaign, CMS, journal and merchandising tables.
- Supabase Security Advisor: **0 security lints**.
- Found two performance-policy overlaps during verification and corrected them:
  - merged public/staff SELECT rules for `journal_articles`;
  - merged public/staff SELECT rules for `landing_sections`;
  - split the Journal staff `ALL` policy into explicit INSERT/UPDATE/DELETE policies so SELECT is not evaluated twice;
  - added missing `landing_sections.created_by` and `landing_sections.updated_by` foreign-key indexes.
- Supabase performance notices that remain are informational unused-index observations; they are not security findings and can be evaluated after real production query traffic exists.

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
- Promotional metadata cannot be treated as authoritative checkout pricing.

## Deliberate phase boundaries

- Automatic scheduled publishing remains 2D-9. A browser timer is not treated as a trusted scheduler.
- Final promotional-price enforcement belongs to the payment/checkout backend and must never trust campaign data supplied by a customer browser.
- Production deployment/build verification is performed after the Vercel preview environment is connected.

## QA gate

The 2D-6 and 2D-8 feature implementation is present in the repository and the Supabase security configuration has been rechecked. The repository's automated quality workflow remains the authoritative TypeScript/build/dependency gate when a workflow run is available.

A successful security-advisor result does **not** mean the application is impossible to hack. Before launch, run the full build, integration tests, authentication/RBAC abuse tests, storage tests, checkout security tests and production penetration/security review.

## Status

- **2D-6 — Ads/Campaigns/Flash Sales: implementation complete; production/build gate pending.**
- **2D-8 — Merchandising: implementation complete; production/build gate pending.**
- **2D-7 — Journal: implementation complete; richer media workflow remains a later enhancement if required by the project roadmap.**
