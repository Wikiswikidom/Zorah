# Zorah Phase 2D-3H + 2D-3I — Catalogue Discovery & Validation QA

## Scope

2D-3H provides admin catalogue search, safe filtering and deterministic sorting. 2D-3I hardens product create/edit request handling and user-facing error behavior.

## Catalogue behavior

- Search is bounded to 80 characters and supports product name/slug discovery.
- Status is limited to draft, published or archived.
- Featured is limited to yes/no.
- Sorting is allowlisted: newest, oldest, name A–Z, name Z–A, price low→high, price high→low.
- Invalid query values fall back to safe defaults rather than reaching the database unchecked.
- Results are capped at 100 records per request to prevent an unbounded admin response.
- URL query state makes filtered catalogue views shareable and refresh-safe.
- Server authorization remains mandatory; the filter UI is not a security boundary.

## Product request validation

- JSON content type is required for product mutation endpoints.
- Malformed JSON returns HTTP 400 instead of an opaque server error.
- Arrays and non-object request bodies are rejected.
- Product IDs must be valid UUIDs before database access.
- Slugs must use the controlled lowercase hyphen format.
- Prices must be finite, non-negative and within the configured upper bound.
- Text fields are trimmed and length-bounded server-side.
- SEO keywords accept only strings and are bounded by count and length.
- Product status is allowlisted.
- Duplicate slugs return a controlled conflict response.
- Database implementation errors are not returned verbatim to clients.
- Authorization is performed before mutations.

## QA cases

1. Search with normal text.
2. Search with punctuation and URL-encoded characters.
3. Empty search.
4. Invalid status/sort/featured query values.
5. Each supported sort order.
6. No-result state.
7. Clear filters.
8. Mobile filter interaction.
9. Create with valid data.
10. Create with malformed JSON.
11. Create with non-JSON content type.
12. Create with missing/invalid name, slug or price.
13. Edit with invalid UUID.
14. Edit with duplicate slug.
15. Attempt mutation without catalogue-admin authorization.
16. Confirm database/RLS remains the final authorization boundary.
17. Confirm no secrets, auth tokens or customer data are exposed in responses.

## Security boundary

The browser may request catalogue operations, but it is never trusted to establish authorization. The intended chain remains:

Browser → Next.js server → Supabase Auth/RBAC → Supabase RLS → PostgreSQL

No service-role/secret key belongs in client-side code.

## Completion rule

2D-3H/3I should only be marked fully complete after runnable build/type checks and the 2D-3J RLS/security abuse tests plus 2D-3K responsive/production QA pass.
