# Phase 2B — Page System

Status: **In progress — frontend routes implemented; interaction and production content remain for 2C/2D.**

## Page map

- `/` — editorial landing page
- `/shop` — product discovery and merchandising surface
- `/collections` — collection-led discovery
- `/products/[slug]` — product detail page (PDP)
- `/search` — search entry point and results foundation
- `/wishlist` — saved-product experience foundation
- `/cart` — bag/cart foundation
- `/custom-orders` — custom request intake
- `/our-story` — brand and craft storytelling
- `/journal` — editorial/news foundation
- `/help` — delivery, returns and leather-care help

## UX rules

1. Product photography is the primary visual asset; decorative UI must never compete with it.
2. Product pages must expose price, availability, primary CTA, dimensions/capacity, materials/care and delivery/returns information without forcing users to hunt.
3. Bag discovery must work by product type, collection, newness and promotional status—not only by internal catalog taxonomy.
4. Mobile is a first-class shopping experience: controls remain reachable, typography stays legible, and purchase actions remain obvious.
5. Editorial storytelling should create brand distinction while every path back to commerce remains clear.
6. Empty states are useful, not dead ends: wishlist/cart/search should provide a clear next action.
7. Accessibility and reduced-motion behavior are part of the baseline, not a later visual polish item.

## Research-backed decisions

Baymard's 2026 product-page research identifies product pages as the centerpiece of ecommerce decision-making and recommends strong product imagery, in-scale imagery for worn accessories, clear purchase actions and accessible return information. Zorah's PDP therefore reserves a large gallery, a clear buy panel and expandable information sections.

Zashadu's current Lagos-made storefront demonstrates the value of collection-led merchandising, local craft storytelling, editorial content and clear product sorting/filtering. Zorah adopts those information patterns without copying its visual identity.

## Phase boundary

2B establishes the route/page architecture and responsive visual foundation. Product-state interactions, persistent wishlist/cart behavior, filtering, sorting, galleries and related-product logic belong to 2C. Admin editing and campaign scheduling belong to 2D.
