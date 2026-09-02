# Phase 2E — Zorah Landing Experience Redesign

## Direction

The public root route `/` is now a **brand/story landing experience**, not the ecommerce storefront. The ecommerce experience begins at `/shop`.

The landing page is intentionally editorial and cinematic. It should communicate what Zorah is before asking the visitor to shop.

## Experience split

- `/` — Zorah house, story, craft, interactive product narrative, brand CTA.
- `/login` — customer sign-in/sign-up.
- `/shop` — ecommerce catalogue and shopping UI.
- `/cart` — shopping cart.
- `/admin` — protected admin workspace.

The landing page must not become a product-grid homepage. Commerce components and campaign rails belong in the shop experience unless deliberately introduced as a brand CTA.

## Visual language

- Primary green: `#173D32`
- Ink: `#111111`
- Warm ivory: `#F5F1E9`
- Muted gold: `#B08A3C`
- UI typography: Open Sans, chosen because current Jumia product pages use Open Sans-family UI typography.
- Editorial display: Cormorant Garamond.
- Motion is restrained, smooth and product-led rather than decorative.

## Motion system

The first interactive story uses Three.js + GSAP ScrollTrigger.

Scroll progression:

1. Silhouette — the bag settles into view and rotates.
2. Interior — the flap opens and the bag contents emerge.
3. Detail — the bag rotates to reveal construction and hardware.
4. Lagos — the product settles back into a hero position while the story changes to the house narrative.

The scene uses procedural geometry for the initial experience so it has no external 3D model dependency. A production handbag GLB can replace the procedural model later without changing the narrative structure.

## Performance rules

- Cap device pixel ratio for WebGL.
- Avoid heavy post-processing on mobile.
- Respect `prefers-reduced-motion`.
- Keep the WebGL scene isolated to the storytelling section.
- Do not put sensitive data in browser storage. The landing theme preference is presentation-only and may use localStorage.

## Research anchors

Current Jumia Nigeria pages show a commerce-first structure with a persistent search/account/help/cart pattern, category/filter controls, product grids, ratings, price/discount presentation, add-to-cart actions and flash-sale countdowns. Those patterns should inform `/shop`, not the Zorah brand landing page.

Three.js + GSAP ScrollTrigger are appropriate for the requested scroll-driven storytelling. ScrollTrigger supports scrub/pin-based timelines, while current premium product experiences commonly use scroll-driven WebGL to rotate, zoom and transition through product features.

## Next visual pass

After this landing foundation is deployed and tested on real mobile hardware, the next pass should replace procedural placeholder geometry with Zorah's final handbag model and approved photography/video assets. The CMS should eventually control copy, CTA labels, story section visibility and campaign content without allowing arbitrary HTML or JavaScript injection.
