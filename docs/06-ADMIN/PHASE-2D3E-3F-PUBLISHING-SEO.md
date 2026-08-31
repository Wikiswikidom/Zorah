# Zorah Phase 2D-3E / 2D-3F — Publishing & Product SEO

## 2D-3E Publishing workflow

Products use three authoritative catalogue states:

- `draft` — not customer-visible.
- `published` — eligible for the storefront, subject to storefront visibility rules.
- `archived` — retired from normal catalogue discovery.

Publishing is performed through a server-authorized route. The browser cannot grant itself catalogue privileges or directly override the database state.

### Scheduling

A product may have a future `scheduled_publish_at` timestamp. The application records this timestamp separately from the product's state so scheduling does not create an unvalidated fourth product state.

Automatic promotion of scheduled products is a deployment/backend concern and will be completed with the scheduling subsystem in 2D-9. Until then, a scheduled timestamp is data, not a promise that a browser timer will publish the product.

### Timestamps

- `published_at` records the latest publication time.
- `scheduled_publish_at` records a future requested publication time.
- `unpublished_at` records when the product was removed from publication.

### Security rules

- Only authenticated catalogue-authorized staff may mutate publishing state.
- Product IDs are validated server-side.
- Status values are allow-listed.
- Scheduled timestamps are parsed and validated server-side.
- Database RLS remains an independent authorization boundary.
- Service/secret keys never enter browser code.

## 2D-3F Product SEO

Product records support:

- SEO title
- SEO description
- SEO keyword array
- semantic product URL using the product slug
- canonical URL
- Open Graph title/description

The product page generates metadata server-side. SEO content is constrained by the product-management form and should describe the real product rather than keyword-stuffing.

### SEO precedence

1. Explicit SEO title/description when supplied.
2. Product short description.
3. Product description.
4. Safe Zorah fallback copy.

### Important architecture note

The current Phase 2 storefront still uses the Phase 2 product catalogue presentation while the production catalogue is being connected end-to-end to Supabase. Therefore SEO metadata is prepared now, but final product availability/indexation must be tied to the real published Supabase catalogue before production launch.

### Future SEO work

2D-3F is the product-level foundation. Structured Product JSON-LD, image metadata, sitemap integration, indexation controls and final search-console validation remain part of the broader SEO phase and production QA.

## QA acceptance criteria

- Draft products are never intentionally exposed as published catalogue records.
- Archived products are excluded from normal published discovery.
- Invalid status transitions are rejected.
- Invalid/far-past schedules are rejected where scheduling is requested.
- SEO fields are escaped by the framework and are never interpreted as HTML/JavaScript.
- Canonical URLs are stable and based on validated slugs.
- Missing SEO fields have sensible fallbacks.
- Authorization is enforced server-side and by RLS.
