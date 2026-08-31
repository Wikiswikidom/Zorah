# Phase 2D-5 — Landing Page CMS

## Goal
Give authorized Zorah staff control over the landing-page content and section order without exposing arbitrary HTML, CSS, JavaScript, or database privileges.

## Implemented
- `landing_sections` Supabase table with RLS.
- Controlled section types: hero, promo, product rail, editorial, craft, collections, custom order, journal, testimonial, newsletter, media.
- Controlled themes: light, dark, leather, green, ivory.
- Draft / published / archived states.
- Enable/disable switch and explicit display order.
- Optional scheduled publish timestamp for the future scheduling phase.
- Internal-only CTA paths (`/shop`, `/collections`, etc.); external or protocol-relative URLs are rejected.
- Server-side validation on create/update.
- Server-side role authorization for content and marketing admins.
- Public storefront reads only enabled published sections.
- Admin workspace at `/admin/content`.
- Published CMS sections are rendered by the public landing page.

## Security model
Browser → Next.js server authorization → Supabase Auth → PostgreSQL RLS.

The CMS deliberately has no arbitrary HTML/JS field. This prevents a content editor from injecting scripts or changing the site's design system. Media paths are treated as data, not executable markup.

Supabase service/secret keys must never be sent to the browser.

## Roles
- `super_admin`: full access.
- `content_admin`: landing-page content management.
- `marketing_admin`: landing-page and campaign-related content management.
- Other roles: no landing CMS mutations.

## Publishing
Immediate publishing is supported. Future timestamps are stored for 2D-9 scheduling automation; a browser timer is never treated as the source of truth.

## UX principles
- Mobile-first editor.
- Clear status and order indicators.
- Safe, controlled fields.
- Fast editing without requiring a developer.
- Zorah typography, palette, spacing and components remain developer-controlled.

## Future extensions
2D-6 will add campaigns, flash sales, announcement bars and promotional placements. 2D-9 will make scheduling automatic and reliable. 2D-10 will add the full audit trail.
