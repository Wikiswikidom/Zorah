# Phase 2D-7 + 2D-8 — Journal & Merchandising

## 2D-7 Journal

The Journal is a controlled editorial CMS backed by Supabase PostgreSQL. Staff can create and edit stories with title, slug, excerpt, body, category, tags and SEO metadata. Publishing states are draft, scheduled, published and archived. Public routes only query published stories; admin routes require content/marketing/super-admin authorization.

Story content is rendered as text, not administrator-supplied HTML or executable JavaScript. This intentionally prevents CMS users from injecting scripts into the storefront.

Routes:
- `/journal`
- `/journal/[slug]`
- `/admin/journal`
- `/admin/journal/new`
- `/admin/journal/[id]`

## 2D-8 Merchandising

Merchandising uses `merchandising_slots` to curate products into named placements with ordering, enable/disable state and optional start/end windows. A placement is only publicly visible when its product is published and its merchandising window is active.

The database remains the authority. Admin mutations must pass authenticated role checks and Supabase RLS. The browser must never be trusted to establish product price, stock or eligibility.

## Security requirements

- RLS enabled on both tables.
- Public reads limited to published/active content.
- Admin writes restricted by role.
- No arbitrary HTML/JS fields.
- Slugs, lengths, status values and tags validated server-side.
- No service-role key in browser code.
- Product visibility remains governed by product publication state.
- Scheduling timestamps are data only; automatic publishing remains a later scheduling phase.

## QA gate

Before declaring 2D-7/2D-8 production-ready, run TypeScript, production build, dependency audit, route tests, RLS abuse tests, responsive checks and storefront smoke tests. Any failure blocks completion until fixed.
