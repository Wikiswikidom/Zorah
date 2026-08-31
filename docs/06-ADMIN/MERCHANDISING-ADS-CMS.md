# Zorah Merchandising, Ads & Content CMS

Status: **Required product capability — planned for Phase 2D**

## Purpose

Zorah must be able to merchandise the storefront without a developer changing React/Next.js code for every campaign. Admins should control content through structured fields while the Zorah design system remains locked.

## Campaign/ad types

1. Announcement strip — short site-wide message.
2. Hero campaign — primary landing-page campaign with image, headline, supporting copy and CTA.
3. Editorial banner — visual story or collection promotion.
4. Flash/limited-time sale — campaign with start/end time, optional countdown, sale badge and destination collection.
5. Product promotion rail — promoted products or collection.
6. News/editorial promotion — journal/news item promoted on landing or shop surfaces.

## Placement controls

Each campaign can target:

- Landing page
- Shop page
- Collection pages
- Product pages
- Announcement strip

An admin can choose one or multiple placements.

## Lifecycle

Every campaign supports:

- Draft
- Scheduled
- Published
- Paused
- Expired
- Archived

Fields include `starts_at`, `ends_at`, `published_at`, `status`, `priority`, `placements`, `cta_label`, `cta_url`, `headline`, `body`, `image`, `mobile_image` and optional countdown settings.

## Landing-page CMS

Admins can manage controlled sections rather than arbitrary HTML:

- Hero
- Campaign banner
- Featured products
- Collection rail
- Craft/story block
- Editorial/news block
- Custom-order CTA
- Journal rail
- Newsletter/lead capture

Each section supports add, edit, reorder, publish/unpublish, schedule and archive.

## Jumia-style merchandising requirement

Zorah may use a recognizable promotional mechanism similar to large marketplaces: a dedicated sale/offer entry point, urgency where truthful, a clear end time and a destination collection. The visual treatment must remain premium and Zorah-specific rather than copying Jumia's UI.

## Safety and quality rules

- Never allow raw HTML editing from ordinary admin forms.
- Validate CTA destinations.
- Require explicit start/end dates for timed campaigns.
- Never show a countdown after the campaign has expired.
- Prevent overlapping hero campaigns unless an explicit priority is set.
- Preserve image aspect-ratio guidance for desktop and mobile.
- Log who published, edited, paused or deleted merchandising content.
- Use role-based permissions so only authorized admins can publish campaigns.

## Future data model

Planned entities: `campaigns`, `campaign_placements`, `landing_sections`, `landing_section_items`, `media_assets`, `journal_posts`, `admin_audit_log`.

Supabase/Postgres and RLS will enforce ownership and role boundaries in Phase 2D.
