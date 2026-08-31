# Zorah Requirements Register

This document is the running source of truth for product requirements added during implementation. New user-requested requirements must be recorded here before being forgotten or treated as an informal chat decision.

## Confirmed requirements

### Brand and visual identity
- Premium, modern, restrained leather-fashion positioning.
- Black + gold logo; official supplied logo must be preserved exactly.
- Core palette: Ink Black `#111111`, Warm Ivory `#F7F3EC`, Deep Leather `#5A3524`, Zorah Green `#173D32`, Muted Gold `#B08A3C`.
- Typography: Cormorant Garamond for editorial/display and Inter for UI/body.
- Photography and typography carry the luxury feeling; animation remains purposeful and restrained.
- Avoid generic AI-template visuals, excessive glassmorphism, neon effects and decorative noise.

### Storefront
- Separate editorial landing page and ecommerce shopping experience.
- Landing page links naturally into the shop.
- Clean, easy-to-navigate navigation on desktop and mobile.
- Product-first presentation with strong photography and product information.
- Shop, collections, product detail, search, wishlist, cart, custom orders, story, journal and help experiences.
- Custom Orders is a first-class commerce path.

### Admin-controlled merchandising
- Admins can create, edit, publish, pause, schedule and remove promotions.
- Promotions can appear on the landing page and ecommerce/shop surfaces.
- Promotion types include announcement strips, hero campaigns, editorial banners, flash/limited-time sales, product promotion rails and news/editorial promotions.
- Promotions support start/end dates and truthful countdowns where appropriate.
- Admins can control which landing-page sections are visible, their order and their content through structured fields.
- Admins must not edit arbitrary HTML; the design system stays controlled.
- Content changes need role-based permissions and an audit trail.
- Jumia-like merchandising mechanics may be used as inspiration for urgency/discovery, but Zorah's visual language must remain premium and original.

### Technical foundation
- Next.js frontend.
- Supabase/Postgres for backend/data/auth capabilities.
- Paystack planned for payments.
- Vercel will be connected when the frontend reaches the appropriate preview/deployment stage.
- GitHub is the source of truth for code and documentation.

## Phase ownership

- Phase 1: documentation, architecture and requirements — complete.
- Phase 2A: frontend foundation — complete.
- Phase 2B: complete page-system foundation — active.
- Phase 2C: ecommerce interaction/state layer — next after 2B.
- Phase 2D: admin CMS and merchandising — follows the interaction layer.

## Change rule

When a new requirement is introduced, record it here and in the relevant technical/design document before implementation. If it changes architecture, also update the architecture/data-model documentation.
