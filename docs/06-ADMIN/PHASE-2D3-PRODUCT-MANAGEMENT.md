# Phase 2D-3 — Product Management

## Objective
Build a secure catalogue-management system for Zorah Handbags. Products are managed by authorised catalogue administrators and are exposed to customers only when explicitly published.

## Product lifecycle
`draft → published → archived`

- Draft products are invisible to the public storefront.
- Published products are eligible for storefront discovery.
- Archived products are retained for historical integrity but removed from normal shopping discovery.
- Publishing is an intentional privileged action; creating a product must never publish it automatically.

## Product fields

### Identity
- Product name
- Unique URL slug
- SKU at variant level
- Short description
- Full product description

### Commerce
- Base price
- Currency (`NGN`)
- Availability
- Variant-specific price overrides
- Stock quantity

### Presentation
- Primary image
- Gallery images
- Variant-linked images
- Image ordering
- Image dimensions
- Required descriptive alt text
- Optional product video/media reference

### Discovery
- Category/collection references (implemented in later 2D subphases)
- Search keywords
- Featured flag
- Product badge such as New, Bestseller or Limited
- Related products (implemented in later merchandising work)

### SEO
- SEO title
- SEO description
- Search keywords
- Canonical/structured-data strategy is documented in Phase 1 SEO documents.

## Variants
Each purchasable variant has:
- SKU
- display name
- colour name
- controlled colour value/hex for presentation
- optional price override
- stock quantity
- availability
- display order

Variant stock must never be trusted from the browser during checkout. The server/database is authoritative.

## Images and media
Product media will ultimately live in Supabase Storage. Public catalogue media may be publicly readable, while administrative upload/mutation permissions remain restricted by Storage RLS. Storage policies must restrict upload, update and delete operations to authorised catalogue staff.

Never accept an arbitrary HTML/JavaScript upload as a product asset. Validate file type, extension, size and dimensions server-side before accepting media.

## Admin permissions
- `super_admin`: full catalogue access
- `catalog_admin`: create, edit, archive, publish and manage catalogue media
- Other roles: no catalogue mutation unless explicitly granted by a future permission model

The browser UI is not the security boundary. Supabase RLS and server-side authorization are authoritative.

## Data integrity rules
1. Slugs are unique.
2. Variant SKUs are globally unique.
3. Prices cannot be negative.
4. Stock quantities cannot be negative.
5. Currency is currently restricted to NGN.
6. Products cannot be publicly visible unless `status = published`.
7. Product audit fields are populated server-side from the authenticated user.
8. Deleting a product cascades its variants and product images; prefer archiving in normal business operations to preserve history.
9. Product prices shown by the client are presentation data only; checkout must re-read authoritative pricing from Supabase.
10. No customer payment data is stored in product records.

## Search and merchandising readiness
The schema intentionally supports later work for:
- category/collection assignment
- full-text/search indexing
- featured products
- new arrivals
- bestseller ranking
- promotions
- related products
- inventory-aware merchandising

## Security requirements
- RLS enabled on every exposed catalogue table.
- Public users can read only published catalogue records.
- Catalogue mutation requires an authenticated user with an authorised role.
- Role information must never come from user-editable metadata or request parameters.
- Privileged helper functions must remain in a non-exposed schema.
- Service/secret keys remain server-only.
- Product IDs, prices, stock and variant selections are revalidated server-side for every sensitive operation.

## Acceptance criteria
- [ ] Catalogue admin can create a draft product.
- [ ] Catalogue admin can edit product details.
- [ ] Catalogue admin can add/edit/remove variants.
- [ ] Catalogue admin can manage gallery metadata.
- [ ] Catalogue admin can publish/unpublish/archive products.
- [ ] Public users cannot read drafts or archived products through the Data API.
- [ ] Customer cannot mutate catalogue data.
- [ ] Non-catalogue admin cannot mutate catalogue data.
- [ ] Direct API requests are denied when the role is insufficient.
- [ ] Product media is protected by Storage RLS.
- [ ] Final product management UI passes mobile, accessibility and keyboard QA.

## Current implementation
The initial PostgreSQL model has been created in the Zorah Supabase project with `products`, `product_variants` and `product_images`, including indexes, RLS policies and server-side audit timestamps.

This phase is not considered production-complete until the admin UI, media workflow, direct-request authorization tests and end-to-end QA are completed.
