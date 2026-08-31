# Phase 2D-5 — Landing CMS QA Checklist

## Authorization
- [ ] Unauthenticated users cannot access `/admin/content`.
- [ ] Customers cannot read unpublished CMS rows.
- [ ] Customers cannot insert, update, reorder, publish, or delete CMS rows.
- [ ] Content/marketing admins can perform only intended CMS actions.
- [ ] Role escalation through request payloads is impossible.

## Validation
- [ ] Section keys are lowercase slug format.
- [ ] Section types and themes are allowlisted.
- [ ] Status is allowlisted.
- [ ] CTA links accept internal paths only.
- [ ] Text fields have bounded lengths.
- [ ] Display order is a non-negative bounded integer.
- [ ] Malformed JSON and unsupported content types return safe errors.

## Publishing
- [ ] Draft sections are invisible publicly.
- [ ] Archived sections are invisible publicly.
- [ ] Disabled sections are invisible publicly.
- [ ] Published sections render in `sort_order`.
- [ ] Reordering does not require code changes.
- [ ] Future scheduling is stored but not simulated with a browser timer.

## UX
- [ ] Create, edit, cancel and delete work on mobile.
- [ ] Loading and error states are understandable.
- [ ] No layout overflow at narrow widths.
- [ ] Keyboard focus remains visible.
- [ ] Labels and controls are accessible.

## Security
- [ ] No service/secret Supabase key reaches client code.
- [ ] RLS remains enabled on `landing_sections`.
- [ ] Public policy exposes only published + enabled rows.
- [ ] Admin policy is role-restricted.
- [ ] No arbitrary HTML/JS field exists.
- [ ] Storage paths are not treated as executable content.
- [ ] Security Advisor remains clean after schema changes.

## Production gate
- [ ] TypeScript check passes.
- [ ] Production build passes.
- [ ] Dependency audit passes.
- [ ] Vercel preview is tested before production deployment.
