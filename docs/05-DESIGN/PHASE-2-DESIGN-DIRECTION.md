# Zorah Phase 2 — Design Direction

**Status:** Approved direction for implementation
**Phase:** 2 — Product design and frontend experience
**Updated:** 2026-08-31

## 1. Design thesis

Zorah should feel like a contemporary African leather house, not a generic online handbag store. The website should combine:

- editorial fashion presentation;
- tactile leather craftsmanship;
- quiet luxury;
- Nigerian/Lagos identity;
- frictionless ecommerce.

The interface must remain restrained. The product and photography are the stars.

## 2. Competitive lessons applied

Research references included Polène, Strathberry, Zashadu, Aspinal of London, DeMellier and current ecommerce UX research.

### What Zorah should borrow
- **Polène:** product-first minimalism, strong material/craft storytelling, useful product categorisation and filters.
- **Strathberry:** editorial campaigns, clear product families, bestsellers/new-arrivals discovery and craftsmanship storytelling.
- **Zashadu:** Lagos identity, chapter/collection storytelling, scarcity/limited-edition language, craft journal content and personalization.
- **Aspinal:** personalization as part of the purchase journey, premium gifting and strong leather education.
- **DeMellier:** timeless positioning, purpose/storytelling without overwhelming the shopping journey.

### What Zorah should not copy
- giant promotional banners everywhere;
- excessive luxury-brand chrome;
- complicated mega-menus;
- decorative animations that slow shopping;
- dark interfaces that hide product detail;
- generic AI-generated gradients, glass cards or floating blobs.

## 3. Brand visual system

### Core palette
| Token | Hex | Usage |
|---|---|---|
| Ink | `#111111` | Primary text, logo, strong UI |
| Warm Ivory | `#F7F3EC` | Main canvas / editorial backgrounds |
| Leather Brown | `#5A3524` | Craft sections, accents, selected surfaces |
| Zorah Green | `#173D32` | Controlled brand accent, selected CTAs/sections |
| Muted Gold | `#B08A3C` | Hardware-inspired accent, dividers, small highlights |

Gold must remain an accent. It should never become a large gradient or primary page fill.

### Gradient rule
Gradients are allowed only as extremely subtle tonal transitions in editorial photography overlays or atmospheric hero backgrounds. No neon gradients, glassmorphism, or purple/blue AI-style gradients.

## 4. Typography

### Recommended pairing
- **Display:** Cormorant Garamond — editorial, fashion-led headings.
- **UI/body:** Inter — highly legible ecommerce interface and utility text.

Fallback stack:
`Georgia, serif` for display and `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` for UI/body.

Typography should use large editorial headlines sparingly and compact utility text for navigation, filters and checkout.

## 5. Navigation

### Desktop
A clean, sticky header with:

**ZORAH** | Shop | Collections | Custom | Our Story | Journal | Search | Account | Wishlist | Bag

Keep the primary navigation to a small number of understandable labels. Search and Bag must remain immediately accessible.

### Mobile
Top row:
- menu;
- centered ZORAH wordmark;
- bag.

Search should be immediately available from the menu and/or header.

The mobile menu should expose:
1. New Arrivals
2. Handbags
3. Collections
4. Custom Orders
5. Gifts
6. Our Story
7. Journal
8. Help / Delivery / Contact

## 6. Landing page architecture

1. **Announcement strip** — optional, only when useful.
2. **Hero** — full-bleed campaign/product image with one clear statement and one primary CTA.
3. **Featured collection** — editorial product row/grid.
4. **Craft story** — material, hands, stitching and Lagos workshop imagery.
5. **Shop by silhouette** — Shoulder / Tote / Crossbody / Mini / Custom.
6. **Signature product feature** — one product with immersive photography.
7. **What fits inside** — practical visual proof.
8. **Custom Orders** — explain the commissioning process.
9. **Journal / Zorah Stories** — craftsmanship, styling, materials, Lagos stories.
10. **Trust strip** — secure payment, delivery, craftsmanship, support.
11. **Newsletter / community**.
12. **Footer** — Shop, Help, About, Legal, social.

The landing page should always provide a natural path into ecommerce.

## 7. Ecommerce architecture

### Collection page
- editorial collection intro;
- product count;
- sort;
- filters for category, colour, material, size, availability and price where relevant;
- responsive product grid;
- quick-add only where it does not hide necessary product choices;
- wishlist;
- strong empty/error states.

### Product page
Above the fold:
- image gallery;
- product name;
- price;
- availability/pre-order state;
- colour/variant selection;
- quantity;
- primary Add to Bag CTA;
- wishlist;
- delivery estimate.

Below:
- description;
- dimensions;
- material and construction;
- what fits inside;
- care instructions;
- shipping/returns;
- reviews;
- related products;
- craftsmanship story.

On mobile, keep Add to Bag accessible through a sticky purchase bar after the initial CTA scrolls away.

## 8. Custom Orders

Custom Orders are a first-class product pathway, not a footer link.

Flow:
1. Discover Custom.
2. Select preferred silhouette or start from a blank brief.
3. Choose leather/colour/hardware where supported.
4. Upload/reference inspiration if supported.
5. Enter dimensions/use case/budget.
6. Submit request.
7. Receive confirmation and expected response time.
8. Staff reviews and communicates through the admin workflow.

## 9. Motion language

Motion should feel like a luxury editorial film translated into UI.

### Approved
- 180–450ms opacity/transform transitions;
- gentle image reveal on scroll;
- image crossfade on product-card hover;
- smooth drawer/menu transitions;
- subtle underline/scale interactions;
- add-to-bag confirmation;
- cart drawer slide-in;
- restrained page transitions.

### Avoid
- bouncing buttons;
- continuous floating objects;
- particle backgrounds;
- excessive parallax;
- scroll-jacking;
- long loading animations;
- animation before a user can interact.

All motion must respect `prefers-reduced-motion`.

## 10. Product photography direction

Every product should ideally have:
- clean front/hero shot;
- rear/side view;
- close-up leather texture;
- hardware/detail shot;
- interior/open view;
- on-body/lifestyle shot;
- scale reference or "what fits" shot.

Photography should use warm natural light, tactile surfaces and controlled composition. Product cutouts should be clean and consistent.

## 11. Premium interaction details

- Product cards should feel calm and spacious.
- Hover may reveal a second product image.
- Colour swatches must be visually accurate.
- Buttons should have tactile but restrained feedback.
- Cart updates should confirm success without hijacking the page.
- Search should provide useful suggestions and recent searches.
- Wishlist should work for signed-in users and have a graceful guest state.
- Filters should preserve scroll context on mobile.

## 12. Conversion principles

Every major page should answer:
- What is this?
- Why should I care?
- What does it look/feel like?
- What does it fit?
- How much is it?
- When will I receive it?
- Can I trust this brand?
- What happens if I need help or a return?

## 13. Accessibility

- WCAG-conscious colour contrast;
- keyboard navigation;
- visible focus states;
- semantic headings;
- descriptive image alt text;
- 44px+ touch targets where practical;
- reduced-motion support;
- no essential information conveyed by colour alone.

## 14. Performance

Luxury should feel fast. Prioritise:
- responsive image sizes;
- AVIF/WebP where supported;
- lazy loading below the fold;
- minimal client-side JavaScript;
- transform/opacity animations;
- reserved image dimensions to prevent layout shift;
- no autoplay video unless it is essential and optimized.

## 15. Implementation principle

The site should feel expensive because of **composition, photography, typography, spacing, material storytelling and interaction quality** — not because of visual effects.
