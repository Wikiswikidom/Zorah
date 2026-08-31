# Phase 2 Roadmap

Phase 2 turns the approved design direction into a production-ready visual system and frontend experience.

## 2A — Frontend foundation (current)
- Next.js application shell
- Global design tokens
- Cormorant Garamond + Inter typography
- Responsive navigation
- Announcement/promotion slot
- Editorial hero
- Product-card system
- Craft/story sections
- Responsive layout and reduced-motion support
- Brand wordmark fallback asset

## 2B — Complete page system
- Shop/collection page
- Product detail page
- Search experience
- Wishlist experience
- Cart drawer/page
- Custom Orders page
- Our Story
- Journal/article template
- Help, delivery, returns and care pages

## 2C — Ecommerce interaction layer
- Product variants
- Image galleries
- Filters and sorting
- Add-to-bag feedback
- Cart quantity/state management
- Wishlist state
- Recently viewed
- Related products
- Mobile sticky purchase controls

## 2D — Admin/content experience
- Admin dashboard
- Product and collection management
- Landing-page section editor
- Ecommerce merchandising controls
- Campaign/ad/promotion manager
- Scheduled campaign start/end dates
- Draft/published states
- Image/media management
- Journal/news management
- Basic audit trail and role-based permissions

## 2E — Motion, performance and accessibility
- Editorial reveal choreography
- Image loading strategy
- Skeleton/perceived-performance states
- Keyboard navigation
- Focus states
- Reduced-motion support
- Core Web Vitals optimization
- Mobile network testing

## 2F — Visual QA and release readiness
- Cross-device QA
- Browser QA
- Content QA
- SEO metadata verification
- Checkout-flow verification
- Accessibility pass
- Production environment configuration
- Vercel deployment and domain connection when the frontend is ready

## Important boundary
Vercel is intentionally not required during 2A. We connect it when the application has enough implemented surface area to benefit from a live preview/deployment environment.
