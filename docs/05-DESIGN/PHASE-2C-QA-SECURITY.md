# Zorah — Phase 2C QA & Security Gate

## Purpose
This document is the quality and security gate for the Phase 2C ecommerce interaction layer. It is a living checklist and must be updated when new commerce behavior is introduced.

## Security position
The Phase 2C browser state is **not trusted data**. Cart, wishlist and recently-viewed data currently use localStorage only for MVP UX persistence. No password, payment secret, authentication token, delivery address, phone number, email, payment response, or other sensitive customer information must be stored in localStorage.

Client-side validation improves resilience and UX but is **not a security boundary**. During the backend phase, prices, inventory, product availability, user identity, permissions, order totals and payment state must be revalidated server-side using Supabase/Postgres and trusted server code.

## QA checklist

### Cart
- [x] Add a product and variant.
- [x] Merge identical product + variant lines.
- [x] Increase/decrease quantity.
- [x] Remove an item.
- [x] Quantity is bounded to a safe integer range.
- [x] Cart state survives refresh when browser storage is available.
- [x] Storage failures do not crash the storefront.
- [x] Invalid/tampered stored cart records are rejected.
- [x] Unknown product slugs are rejected.
- [ ] Backend inventory validation — Phase 4/7.
- [ ] Server-side price validation — Phase 7.

### Wishlist
- [x] Save/remove products.
- [x] Wishlist state survives refresh when browser storage is available.
- [x] Invalid stored product identifiers are rejected.
- [ ] Authenticated server persistence — Phase 4.

### Recently viewed
- [x] Duplicate views move to the front.
- [x] Maximum of 8 entries.
- [x] Invalid identifiers are rejected.
- [x] Storage failure is non-fatal.

### Product gallery / variants
- [x] Product and variant identifiers are constrained.
- [x] Gallery interaction remains independent from cart state.
- [ ] Real product media QA — requires final photography.
- [ ] Image dimensions, loading, zoom and mobile gesture QA — final media pass.

### Filters / sorting
- [x] Category filter.
- [x] Colour filter.
- [x] Availability filter.
- [x] Price ceiling foundation.
- [x] Sorting.
- [x] Applied filter visibility.
- [x] Clear-all behavior.
- [x] Mobile filter drawer.
- [ ] Large-catalog performance test — after real catalog is available.

## Browser security rules
1. Never trust localStorage, query parameters, form fields, cookies or client state for authorization.
2. Never put Supabase service-role keys, Paystack secret keys, email provider secrets or other private credentials in client code.
3. Only explicitly public values may use a client-exposed environment variable.
4. Do not render untrusted HTML from CMS fields. Use structured fields and safe text rendering.
5. Validate and constrain all uploaded files before storage; inspect MIME type, extension, size and dimensions server-side.
6. Enforce authorization server-side and with Supabase RLS for database access.
7. Admin operations require RBAC and should be recorded in audit logs.
8. Payment webhooks must be authenticated/verified and processed idempotently.
9. Order totals and inventory must be recalculated from trusted database values before fulfillment.
10. Do not expose customer records through public product/search endpoints.
11. Account, checkout, order and admin pages must not be indexable by search engines.
12. Add security headers/CSP before production launch.
13. Use rate limiting and abuse controls for authentication, custom orders, contact forms and sensitive endpoints.
14. Dependencies must be kept current and checked for known vulnerabilities.

## Known MVP boundary
localStorage is appropriate for non-sensitive browser convenience state during this frontend-only stage. It is not appropriate for customer accounts or sensitive commerce records. Supabase-backed persistence and server authorization replace this mechanism when authenticated commerce is implemented.

## Release gate
Phase 2C must not be declared production-ready until the project has:
- a successful production build;
- type checking without errors;
- automated lint/static analysis without errors;
- functional browser testing on mobile and desktop;
- server-side authorization and RLS tests once backend work begins;
- payment verification tests before accepting real payments;
- no secrets committed to Git;
- final accessibility and performance review.

## Security expectation
No website can honestly be promised to be impossible to hack. The Zorah goal is defense in depth: minimize exposed data, enforce least privilege, validate on trusted servers, isolate sensitive operations, log privileged actions, and continuously test the attack surface.
