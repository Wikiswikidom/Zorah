# Phase 2D-3A / 2D-3B — Create & Edit Products

## Goal
Provide a secure, responsive catalogue workflow for authorised catalogue staff to create and edit core Zorah product records.

## Implemented
- `/admin/products/new` create workflow
- `/admin/products/[id]` edit workflow
- Server-side POST/PATCH API routes
- Server-side catalogue-role authorization
- Supabase-backed persistence
- Automatic slug generation with manual override
- NGN price validation and numeric bounds
- Draft / published / archived status
- Featured flag and controlled badge
- Short description and full description
- SEO title, description and keyword list
- Duplicate-slug conflict handling
- Safe user-facing errors without leaking database details
- Mobile-responsive forms and disabled state during save

## Security rules
The browser is treated as untrusted. The API validates all submitted fields again. Product mutation endpoints require an authenticated catalogue administrator (or super admin), and Supabase RLS remains the database enforcement layer. No service-role key is exposed to the browser.

## Deliberate scope boundary
Variants, image/media uploads, collections and inventory remain separate implementation slices (2D-3C onward). This prevents the product form from becoming an unsafe all-in-one mutation surface.

## Acceptance criteria
1. Unauthenticated users cannot create or edit products.
2. Non-catalogue staff cannot mutate products.
3. Invalid IDs, names, slugs and prices are rejected server-side.
4. Duplicate slugs return a controlled conflict.
5. Successful create/edit returns to the catalogue.
6. Draft products remain subject to the existing public visibility policy.
7. No secrets or customer data are stored in client state.
8. Errors do not expose SQL, stack traces or internal implementation details.
