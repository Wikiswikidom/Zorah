# Zorah Content & Merchandising Management Requirements

## Goal
Allow authorized Zorah staff to change marketing content without developer intervention while protecting the visual system and customer experience.

## Campaign / ad manager
Admins can create, edit, publish, unpublish and schedule promotional units that can appear on:
- Landing page
- Shop/ecommerce page
- Collection pages
- Product pages where explicitly enabled

Each campaign supports:
- Internal campaign name
- Public headline
- Supporting copy
- CTA label
- Destination URL or internal destination
- Desktop artwork
- Mobile artwork
- Optional background colour
- Optional accent colour restricted to approved brand tokens
- Start date/time
- End date/time
- Priority/order
- Active/inactive state
- Draft/published state

## Campaign types
1. Announcement strip — compact site-wide message.
2. Hero campaign — primary landing-page campaign.
3. Editorial banner — visual story or collection promotion.
4. Flash/limited-time sale — countdown and offer messaging.
5. Product rail — curated products attached to a campaign.
6. News/editorial card — journal or announcement promotion.

## Jumia-style promotion, adapted for Zorah
Zorah can use the merchandising principle behind major marketplaces' flash-sale modules without copying their visual language. A promotion may have a visible end time, a curated product set and a strong CTA. The visual treatment remains premium and restrained.

## Landing-page editor
Admins can manage an approved set of sections:
- Hero
- Campaign banner
- Featured collection
- Product rail
- Craft story
- Editorial image/text
- Custom Orders CTA
- Journal/news rail
- Newsletter/relationship CTA

Admins can reorder sections, change content, choose published media and toggle sections on/off. Free-form HTML is not permitted.

## Ecommerce merchandising
Admins can control:
- Featured products
- Collection order
- Product badges
- Sale messaging
- Promotional product rails
- Campaign banners
- Empty-state copy
- Collection introductions

## Safety / governance
- Content changes use draft/publish states.
- Scheduled campaigns must have explicit start/end times.
- Only approved design tokens may be used for colours.
- Admin roles must be separated from customer roles.
- Media should be validated for dimensions/file size.
- Every publish action should be attributable to an admin account.
- No content editor should be able to inject arbitrary scripts.

## Recommended Supabase entities for later implementation
- `campaigns`
- `campaign_slots`
- `landing_sections`
- `landing_section_items`
- `collections`
- `products`
- `product_media`
- `journal_posts`
- `admin_audit_log`

This document defines the Phase 2D target; the database and RLS implementation will be handled in the appropriate backend phase.
