# Phase 2D-4 — Collections + Inventory

## Goal
Provide catalogue administrators with secure tools to curate products into collections and manage variant-level stock without allowing the browser to become the source of truth.

## Collections
- Unique name/slug with server validation.
- Draft, published and archived lifecycle.
- Display ordering.
- Description and controlled SEO fields.
- Product assignment through a join table.
- Storefront visibility requires both the collection and product to be published.
- Admin mutations require an active `catalog_admin` or `super_admin`.
- RLS remains authoritative.

## Inventory
Inventory is variant-level because SKU/colour variants can carry different stock quantities.

Every adjustment is recorded in `inventory_movements` with:
- variant
- signed quantity delta
- reason
- optional reference
- notes
- authenticated actor
- timestamp

The database trigger applies the movement atomically and rejects any movement that would make stock negative. The client cannot directly set a trusted stock quantity.

Supported reasons: `restock`, `sale`, `adjustment`, `return`, `damage`, `correction`.

## Security
- RLS enabled on all new tables.
- Public users can only read published collection/product combinations.
- Catalogue staff can manage collections and inventory movements.
- Inventory movement creation records the authenticated user as `created_by`.
- No service-role key is used in browser code.
- IDs, quantities, reasons and text are validated server-side.
- Product assignment validates that submitted IDs exist.

## Performance hardening
RLS policies use a single select policy per action where possible and wrap `auth.uid()` in a scalar select to avoid per-row re-evaluation. Foreign-key indexes are provided for the new actor relationships.

## Future extensions
- Collection cover media.
- Scheduled collection publishing through 2D-9.
- Low-stock thresholds and alerts.
- Stock history UI.
- Inventory reservation during checkout.
- Order-driven stock decrement in the commerce/payment phases.
