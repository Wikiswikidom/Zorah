# Zorah Phase 2D-3J + 2D-3K — Final Security & Production QA Gate

## Purpose

This is the final gate for Product Management (2D-3). The product catalogue must not be declared complete until authorization, RLS, storage isolation, input validation, responsive behavior and automated build checks have been reviewed.

## 2D-3J — Security / RLS abuse review

### Authorization boundary

- `/admin` and catalogue mutation routes require an authenticated active staff profile.
- Catalogue mutations are restricted to `catalog_admin` and `super_admin` through server-side authorization.
- Client-side role checks are never treated as sufficient authorization.
- Supabase RLS remains the database enforcement layer.
- Product, variant and image mutations validate identifiers and relationships server-side.

### Customer isolation

- Customers can read only their own profile data, subject to the profile RLS policy.
- Customers cannot assign themselves a staff role.
- Staff access is based on the database role and active state, not browser state.
- No customer passwords, session secrets, payment credentials or sensitive order information are stored in browser localStorage.

### Product visibility

- Anonymous/authenticated storefront access is limited to published catalogue records.
- Draft and archived catalogue records require catalogue staff access.
- Private product media is stored in the private `product-media` bucket.
- Storage has no public read policy; admin previews use short-lived signed URLs.

### Abuse cases to verify

1. Anonymous request to an admin page → denied/redirected.
2. Authenticated customer request to an admin page → denied.
3. Customer attempts direct product INSERT/UPDATE/DELETE → denied by RLS.
4. Non-catalogue staff attempts catalogue mutation → denied.
5. Catalogue staff attempts to mutate another resource using an invalid/mismatched UUID → rejected.
6. Attempt to modify a product through a forged `created_by`/`updated_by` value → rejected by validation/RLS.
7. Attempt to create duplicate SKU or slug → controlled conflict.
8. Attempt to upload a disallowed file type or oversized file → rejected.
9. Direct public read of a private product-media object → denied.
10. Attempt to expose service-role/secret credentials to the browser → prohibited by architecture and code review.
11. Malformed JSON, unexpected fields, oversized strings and invalid enum values → rejected.
12. Attempt to use untrusted query parameters to bypass catalogue filters → allowlist/fallback behavior only.

## 2D-3K — Mobile / production QA

### Responsive checklist

- 320px minimum viewport: no horizontal page overflow.
- 375px and 390px: forms, tables/cards and action controls remain usable.
- 768px tablet: two-column admin layouts collapse gracefully where needed.
- Desktop: catalogue and product editor use the full available workspace without excessive line length.
- Touch targets remain comfortably tappable.
- Long product names, slugs, validation errors and empty states do not break layout.
- Media previews preserve aspect ratio and remain usable on narrow screens.

### Accessibility checklist

- Form labels are associated with inputs.
- Keyboard focus is visible.
- Interactive controls have descriptive accessible names.
- Status and error messages are understandable without relying on color alone.
- Images require meaningful alt text where product imagery is presented.
- Reduced-motion preferences must be respected by motion added in later phases.

### Build gate

GitHub Actions now runs:

1. `npx tsc --noEmit`
2. `npm run build`
3. `npm audit --audit-level=high`

The CI workflow uses placeholder public Supabase variables only. No Supabase secret/service-role key is committed or exposed.

A successful GitHub Actions run is required before production deployment. Vercel will later provide the real deployment/build verification with the actual project environment variables.

## Known limitation

Connector-level review cannot simulate a real customer's authenticated browser session or a malicious external actor. Final abuse testing must therefore be repeated against the deployed application with separate customer, catalogue-admin and unauthorized-staff test accounts before launch.

## Completion rule

2D-3 is complete only when:

- 2D-3A through 2D-3I are implemented;
- RLS and authorization review has no unresolved critical/high finding;
- private media remains inaccessible without authorization;
- mobile/accessibility checks pass;
- GitHub quality workflow passes TypeScript, production build and dependency audit;
- deployment smoke testing passes once Vercel is connected.
