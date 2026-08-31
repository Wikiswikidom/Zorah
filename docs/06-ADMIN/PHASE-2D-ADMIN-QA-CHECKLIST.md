# Phase 2D — Admin QA Checklist

## Access control
- [ ] Unauthenticated users cannot access admin routes.
- [ ] Each admin role is checked server-side.
- [ ] Direct API calls cannot bypass role restrictions.
- [ ] A lower-privilege admin cannot grant themselves a higher role.
- [ ] Admin sessions expire/revoke correctly.
- [ ] Privileged accounts support MFA where configured.

## Products
- [ ] Create/edit/archive/publish works.
- [ ] Invalid prices, quantities and identifiers are rejected.
- [ ] Variants cannot create duplicate/invalid inventory states.
- [ ] Product media is validated.
- [ ] Unpublished products cannot be purchased through public endpoints.

## CMS
- [ ] Draft content remains private.
- [ ] Preview is not indexed publicly.
- [ ] Publish/unpublish works.
- [ ] Scheduled content appears only inside its valid window.
- [ ] Expired promotions stop displaying.
- [ ] Ordering is deterministic.
- [ ] CMS fields cannot execute arbitrary JavaScript.

## Promotions
- [ ] Flash-sale dates are server-validated.
- [ ] Sale prices are verified server-side at checkout.
- [ ] Inventory limits are respected.
- [ ] Expired campaigns cannot be activated by stale client state.
- [ ] Campaign priority behaves predictably when multiple campaigns target one placement.

## Audit
- [ ] Privileged mutations create audit events.
- [ ] Audit events cannot be edited by normal admins.
- [ ] Secrets and passwords never appear in logs.

## Security tests
- [ ] IDOR attempts.
- [ ] Horizontal privilege escalation.
- [ ] Vertical privilege escalation.
- [ ] Session replay/invalid-session handling.
- [ ] Rate-limit enforcement.
- [ ] Malformed JSON/input.
- [ ] Oversized payloads.
- [ ] Unsafe file uploads.
- [ ] Stored/reflected XSS attempts.
- [ ] CSRF checks where applicable.
- [ ] Database RLS bypass attempts.

## Release gate
Do not call Phase 2D production-ready until all required checks pass and the backend/database implementation exists. Frontend-only role hiding is never considered sufficient security.
