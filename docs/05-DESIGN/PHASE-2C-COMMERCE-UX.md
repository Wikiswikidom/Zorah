# Zorah — Phase 2C Commerce UX

## Status
Active implementation. This is the source of truth for the 2C interaction layer.

## Implemented
- Product variants and colour selection
- Quantity controls and add-to-bag feedback
- Persistent cart state in localStorage for the MVP
- Cart quantity changes and removal
- Wishlist save/remove state in localStorage
- Product-card wishlist affordance
- Recently viewed products, capped to 8
- Related product recommendations
- Product image gallery with active thumbnails
- Shop filtering by category, colour and availability
- Price-ceiling filter foundation
- Sorting by featured, name and price
- Applied-filter chips and clear-all
- Mobile filter drawer with explicit result-count action
- Mobile sticky purchase controls

## UX rules
1. Variations belong to one product listing rather than duplicate cards.
2. Applied filters remain visible.
3. Desktop filters can update immediately; mobile uses an explicit Show X Results action.
4. Product galleries support front, detail and worn/in-scale views when real photography arrives.
5. Add-to-bag confirms immediately without forcing navigation.
6. Cart state survives refreshes in the MVP.
7. Wishlist and recently viewed are local-first until account persistence is ready.
8. Mobile purchase action remains reachable without a long return scroll.
9. Real photography replaces placeholders without changing interaction contracts.
10. Touch targets and legibility take priority over decorative motion.

## Data readiness
The catalog now supports `priceValue`, `colors`, `availability`, `featuredRank`, and `variants`. Exact prices remain placeholders until the real Zorah catalog is supplied.

## Integration boundaries
Supabase will replace localStorage for authenticated persistence. Inventory, exact prices, variant stock and media will become database-driven. Paystack checkout belongs to the later payment phase. Phase 2D admin merchandising must promote products without changing these interaction contracts.

## Research basis
Baymard research emphasizes visible applied filters, category-specific filtering, combined filter values, strong sorting, multiple product thumbnails, and a dedicated mobile filter interface with an explicit result action. Zorah follows those principles with a restrained luxury presentation.
