# Phase 2D-3 — Product Management QA Checklist

## Access control
- [ ] Anonymous user can only read published catalogue records.
- [ ] Customer cannot create/update/delete products.
- [ ] Support/marketing/content/order/analytics admins cannot mutate products unless an explicit future permission grants it.
- [ ] Catalog Admin can perform only catalogue operations.
- [ ] Super Admin can perform catalogue operations.
- [ ] Direct REST/Data API mutation tests confirm RLS denial for unauthorised roles.

## Product lifecycle
- [ ] New product defaults to draft.
- [ ] Draft never appears in public shop/search.
- [ ] Publish requires authorised admin.
- [ ] Archive removes product from normal public discovery.
- [ ] Repeated publish/archive operations are safe and idempotent.

## Data validation
- [ ] Empty/whitespace product names rejected.
- [ ] Invalid slug rejected.
- [ ] Duplicate slug rejected cleanly.
- [ ] Negative price rejected.
- [ ] Negative stock rejected.
- [ ] Duplicate SKU rejected.
- [ ] Invalid colour value rejected.
- [ ] Oversized descriptions/keywords handled safely.
- [ ] Untrusted HTML/script input is escaped or sanitised before rendering.

## Media
- [ ] Only approved image/media types accepted.
- [ ] File-size limit enforced server-side.
- [ ] Filename/path cannot escape the intended storage location.
- [ ] Alt text required for catalogue images.
- [ ] Public customer access is read-only for published catalogue media.
- [ ] Upload/update/delete permissions are restricted by Storage RLS.

## Commerce integrity
- [ ] Client cannot change authoritative product price.
- [ ] Client cannot create stock.
- [ ] Variant availability is rechecked server-side.
- [ ] Archived/unavailable variants cannot be purchased.
- [ ] Checkout re-reads current product and variant data.

## Regression
- [ ] Product cards still render correctly.
- [ ] Product pages still render correctly.
- [ ] Search/filter/sort continue to work.
- [ ] Wishlist/cart are unaffected.
- [ ] Mobile product management is usable.
- [ ] Keyboard navigation works.
- [ ] No sensitive data is written to localStorage.

## Production gate
- [ ] TypeScript passes.
- [ ] Lint passes.
- [ ] Production build passes.
- [ ] Supabase security advisor reviewed.
- [ ] Supabase performance advisor reviewed.
- [ ] RLS tests pass.
- [ ] Error logging/monitoring configured before production.
