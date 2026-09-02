# Phase 2B — Editorial Motion Reset

## Decision

The Zorah homepage is intentionally not a Three.js product scene. The previous giant rotating procedural handbag was removed because it dominated the viewport without communicating the brand story clearly.

## Direction

The landing page now follows a luxury-fashion editorial structure: restrained navigation, oversized serif display type, Open Sans utility copy, controlled Zorah green / warm ivory / leather brown / muted gold, generous whitespace, strong hierarchy, and motion that supports the narrative rather than competing with it.

## Motion system

- GSAP + ScrollTrigger only; no WebGL dependency on the landing page.
- Hero copy reveals on entry.
- Oversized Z mark and editorial cards move subtly with scroll.
- Story sections reveal progressively.
- Media panels use restrained parallax.
- Craft section uses progressive line reveals.
- `prefers-reduced-motion` is respected.

## Landing / commerce boundary

`/` remains a brand and craftsmanship experience. `/shop` remains the practical ecommerce experience with commerce-first navigation, filtering, product discovery, cart and checkout.

## Authentication boundary

`/login` is a dedicated branded authentication surface. Successful authentication now lands on `/account`, which is a real authenticated destination rather than an empty/missing page. Admin access remains role-controlled; no client-side promotion of ordinary customers is performed.

## Asset

The uploaded Zorah logo was added as `public/brand/zorah-logo.webp` for the redesigned branded surfaces.
