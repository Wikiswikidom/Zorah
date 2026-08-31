# Phase 2D-3C / 2D-3D — Variants & Product Media

## Goals
Provide catalog administrators with controlled management of purchasable product variants and product imagery while keeping Supabase as the source of truth.

## Variant model
Each variant belongs to one product and supports:
- SKU (unique, normalized uppercase)
- variant name
- colour name
- colour hex value (validated)
- optional variant-specific NGN price
- integer stock quantity
- availability flag
- default variant
- deterministic ordering

## Rules
- Variant writes require authenticated catalog-admin access.
- Supabase RLS remains authoritative; UI checks are not security boundaries.
- SKU, UUID, price and stock values are validated server-side.
- The browser cannot grant itself catalog permissions.
- Product price/stock will be revalidated server-side again when cart/checkout is implemented.
- A product may have one default variant; default changes must be transactional in the final database workflow.

## Media model
`product_images` stores metadata only: product, optional variant, storage path, alt text, dimensions, order and primary flag.

Actual files live in the dedicated Supabase Storage `product-media` bucket.

## Media security
The bucket is private. Draft product media must not be publicly readable. Catalog administrators upload/update/delete through authenticated paths. Public storefront delivery will use controlled server-generated access (signed URLs or equivalent) after publication rules are enforced.

Accepted image MIME types: JPEG, PNG, WebP, AVIF.
Maximum configured file size: 10 MiB.

Future upload validation must also inspect file signatures/content, not merely the browser-provided MIME type, and must normalize generated storage paths so user input cannot control arbitrary object locations.

## UX
- Variant manager lives under each product.
- Clear SKU, colour, price, stock and availability fields.
- Default variant is explicit.
- Empty state and error states are accessible.
- Media manager will support upload, preview, ordering, primary image and variant association.
- Mobile admin controls remain usable without horizontal scrolling.

## Security posture
Never expose Supabase secret/service-role keys to the browser. Do not store customer information or credentials in localStorage. Storage access and database writes remain authenticated and policy-controlled.
