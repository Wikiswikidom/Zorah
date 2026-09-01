# Phase 2D-6 — Campaigns, Ads & Promotions

## Goal
Give Zorah marketing/content staff a controlled merchandising system for landing-page and shop promotions without editing application code.

## Supported campaign types
- Announcement
- Hero campaign
- Promotional banner
- Flash / limited-time sale
- Product promotion
- Collection promotion
- Editorial promotion

## Lifecycle
`draft → scheduled → live → paused → expired → archived`

The database stores start/end timestamps. Automatic transitions belong to Phase 2D-9; a browser timer is never the source of truth for publishing.

## Placement
Campaigns can target `landing`, `shop`, or `both`.

## Merchandising controls
- Priority ordering
- CTA label and internal destination
- Optional media path
- Countdown flag
- Percentage or fixed-amount promotion metadata
- Campaign start/end windows

Promotion metadata is not trusted for payment. Final prices, inventory and order totals must be calculated/verified server-side in the later commerce/payment phases.

## Security
- RLS is enabled on campaigns and campaign target tables.
- Public users can read only currently live, time-valid campaigns.
- Marketing mutations require `marketing_admin` or `super_admin` at the database boundary.
- Content administrators may read campaigns for editorial coordination but cannot mutate marketing campaigns through the campaign API.
- CTA destinations are restricted to internal paths.
- No arbitrary HTML, JavaScript, SQL or executable template content is stored as campaign content.
- Service-role/secret keys never reach the browser.

## Data model
- `campaigns`
- `campaign_products`
- `campaign_collections`

## Admin surface
`/admin/campaigns`

The first implementation provides create, edit, delete, status, placement, timing, priority, countdown and discount metadata controls. Product/collection targeting and rich media assignment are extended in the following merchandising work where appropriate.

## Future integration
2D-6 feeds the public landing/shop experience and later connects to:
- 2D-8 Merchandising
- 2D-9 Scheduling
- Product inventory
- Orders and payments

## Non-goals
Campaigns do not authorize discounts at checkout. A customer/browser can never set a trusted order price by modifying campaign or product data locally.
