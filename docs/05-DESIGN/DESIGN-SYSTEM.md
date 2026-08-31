# Design System

## Direction
Luxury editorial with Nigerian craft identity and modern ecommerce clarity.

## Palette
- Ink Black: `#111111`
- Warm Ivory: `#F7F3EC`
- Deep Leather Brown: `#5A3524`
- Controlled Zorah Green: `#173D32`
- Muted Gold: `#B08A3C`

Gold is an accent, not a dominant fill. Green and leather tones should appear primarily in product/context imagery and selected UI accents.

## Gradients
Use gradients sparingly. Only subtle tonal transitions are permitted for editorial image overlays or atmospheric backgrounds. No neon, glassmorphism, or generic AI-style gradients.

## Typography
- Display: **Cormorant Garamond** — editorial headings and selected brand statements.
- UI/body: **Inter** — navigation, product information, forms, filters and checkout.
- Fallback display: `Georgia, serif`.
- Fallback UI: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.

Typography should use a strong hierarchy, generous whitespace and restrained tracking. Avoid using display serif for dense UI.

## Layout principles
- Product photography is the visual hero.
- Use generous whitespace rather than decorative containers.
- Prefer editorial full-bleed imagery for storytelling sections.
- Use cards only when they improve scanning or interaction.
- Keep alignment and spacing systematic.

## Navigation
Desktop navigation: Shop, Collections, Custom, Our Story, Journal, Search, Account, Wishlist, Bag.

Mobile navigation: Menu, centered ZORAH wordmark, Bag, with Search immediately accessible.

## Motion
Use purposeful opacity/transform transitions, image reveals, subtle hover states, menu/cart transitions and add-to-bag feedback. Respect `prefers-reduced-motion`.

## Components
Components must use design tokens rather than arbitrary one-off values. Core primitives include Header, AnnouncementBar, Button, Link, ProductCard, ProductGrid, FilterDrawer, SearchOverlay, CartDrawer, ImageGallery, ProductPurchasePanel, Accordion, Modal, Toast, Breadcrumbs, CollectionHero and Footer.
