# Phase 2D — Admin CMS, Merchandising & Governance Specification

## Objective
Build a secure, role-based administration system for managing Zorah's catalogue, commerce merchandising, landing-page content and editorial content without allowing administrators to alter application code or bypass security controls.

## Scope

### Product management
- Create, edit, archive and publish products.
- Product name, slug, description, price, compare-at price, SKU, status and SEO fields.
- Multiple images and optional product video.
- Variants such as colour, size and hardware where applicable.
- Stock quantity and availability.
- Materials, dimensions, care instructions and what-fits-inside content.
- Product badges: New, Bestseller, Limited, Sale.
- Related products and manual merchandising overrides.
- Preview before publishing.

### Collections
- Create and edit collections.
- Collection title, description, cover media and SEO metadata.
- Manual or rule-based product membership.
- Ordering/priority controls.
- Publish/unpublish and scheduling.

### Landing-page CMS
Controlled blocks only; administrators must not enter arbitrary HTML/JavaScript.

Supported blocks should include:
- Hero
- Announcement bar
- Campaign banner
- Featured collection
- Product rail/grid
- Editorial/story block
- Craftsmanship block
- Custom-order CTA
- Journal/news block
- Newsletter block
- Image/video feature
- Testimonials

Each block supports draft, preview, publish, unpublish, scheduling and ordering where appropriate.

### Advertising and campaigns
Admins can create promotions for the landing page and shop:
- Announcement strip
- Hero campaign
- Promotional banner
- Flash sale
- Product promotion rail
- Collection promotion
- News/editorial promotion

Campaign fields:
- Internal name
- Public headline
- Supporting copy
- CTA label and destination
- Media
- Target products/collections
- Start date/time
- End date/time
- Placement
- Priority
- Status

Lifecycle:
`DRAFT → SCHEDULED → LIVE → PAUSED/EXPIRED → ARCHIVED`

Flash sales may display a countdown, but all sale pricing and eligibility must be validated server-side before checkout.

### News and Journal
- Create/edit article.
- Draft and preview.
- Cover image.
- Author/byline.
- Category/tags.
- SEO title/description.
- Slug.
- Related products/collections.
- Publish scheduling.
- Archive/unpublish.

### Merchandising
- Featured products.
- New arrivals.
- Best sellers.
- Collection ordering.
- Product ranking overrides.
- Promotional placement.
- Related-product rules.
- Time-based campaigns.
- Inventory-aware merchandising so unavailable products are not promoted as purchasable.

## Roles

### Super Admin
Full administration, role assignment, security settings and audit access.

### Catalog Admin
Products, variants, collections and inventory.

### Order Admin
Orders, fulfilment and delivery operations.

### Content Admin
Landing page, news, journal and media content.

### Marketing Admin
Campaigns, promotions, flash sales and merchandising.

### Support Admin
Customers, enquiries and custom-order communication, subject to privacy permissions.

### Analytics Admin
Read-only business and performance reporting.

Role permissions must be enforced server-side and through database RLS. Hiding UI controls is not authorization.

## Audit trail
Record security-sensitive administrative actions:
- actor
- role
- action
- resource type/id
- timestamp
- result
- relevant before/after metadata where safe

Never put passwords, authentication secrets, payment secrets or sensitive credentials into audit logs.

## Security requirements
- Server-side authorization for every privileged operation.
- RLS for database access.
- Least-privilege roles.
- No client-controlled admin role assignment.
- Secure session handling.
- MFA for privileged accounts where supported.
- Rate limiting and brute-force protection on admin authentication.
- CSRF protection where applicable.
- Strict input validation and output encoding.
- Safe rich-text handling; sanitize any permitted formatted content.
- No arbitrary HTML/JS/CSS execution through CMS fields.
- Secure media uploads with MIME/type validation, size limits and safe filenames.
- Payment status must never be changed manually by ordinary content/admin roles.
- Every destructive operation should require confirmation and preferably support soft-delete/archive where appropriate.

## Publishing safety
- Draft/preview must not expose unpublished content publicly.
- Scheduled content uses server time consistently.
- Expired campaigns automatically stop displaying.
- Cache invalidation/revalidation must occur after publication changes.
- Published content should be versionable so accidental edits can be recovered.

## Data ownership
Business owners should control their content through the CMS, while application logic, design-system constraints and security policies remain developer-controlled.

## Acceptance criteria
Phase 2D is complete only when:
1. Each role can perform only its permitted actions.
2. Unauthorized direct API requests are rejected.
3. Product CRUD and publishing work correctly.
4. Collections and merchandising work correctly.
5. Landing-page blocks can be created, reordered, scheduled and unpublished.
6. Promotions and flash sales respect start/end times.
7. News/journal publishing works.
8. Audit records are generated for privileged changes.
9. No CMS field can execute arbitrary scripts.
10. Security tests cover IDOR, privilege escalation, unauthorized mutation, malformed input and session abuse.
