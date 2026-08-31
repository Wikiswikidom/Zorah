# Phase 2D-3G + 2D-3H — Product Preview & Admin Catalogue Discovery

## 2D-3G Product Preview

Product preview is a private admin-only view. It is never a substitute for server authorization and it does not make draft product media public.

### Requirements
- Accessible only to authorized catalogue administrators.
- Shows the current saved product record, status, badge, price, description and SEO fallback state.
- Shows whether private media exists without exposing permanent storage URLs.
- Includes a clear return-to-editor action.
- Uses the same Zorah visual language as the storefront while clearly identifying preview mode.
- Draft and archived products must remain inaccessible through the public product route.

### Security
Preview requests are authorized on the server before database access. Private Supabase Storage media must continue to use controlled short-lived signed URLs when actual image rendering is introduced.

## 2D-3H Admin Catalogue Search & Filtering

The admin catalogue needs fast discovery without weakening authorization.

### Search
Search by product name and slug. Search input should be debounced in a future client-enhanced implementation and must never be used as an authorization mechanism.

### Filters
- Status: draft, published, archived
- Featured: yes/no
- Badge where supported
- Availability/inventory when inventory data is available

### Sorting
- Newest
- Oldest
- Name A–Z
- Name Z–A
- Price low–high
- Price high–low

### UX
- Search/filter state should be reflected in the URL where practical so an admin can refresh or share an internal navigation state.
- Provide Clear all.
- Preserve mobile usability with a compact filter control/drawer.
- Empty states should explain whether no products exist or the current filters returned no matches.
- Result counts should be visible.

### Security
Filtering and search only change which authorized records are returned. They never bypass RLS or server-side role checks. Query parameters must be validated and bounded to prevent abuse or unexpectedly expensive queries.

## Acceptance gate
2D-3G and 2D-3H are implemented only after functional, authorization, malformed-input, mobile and production-build testing passes. Full 2D-3 completion still requires 2D-3I through 2D-3K.