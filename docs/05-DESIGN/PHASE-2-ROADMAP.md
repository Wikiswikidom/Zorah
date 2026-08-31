# Phase 2 Roadmap

Phase 2 turns the approved design direction into a production-ready visual system and frontend experience.

## 2A — Frontend foundation — **COMPLETE**
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
- Initial visual language and motion principles

## 2B — Complete page system — **ACTIVE**
- Shop/collection page
- Product detail page
- Search experience foundation
- Wishlist experience foundation
- Cart/bag foundation
- Custom Orders page
- Our Story
- Journal/article foundation
- Help, delivery, returns and care foundation
- Shared catalog model and route architecture
- Consistent responsive page styling

2B is not considered production-complete until real product media/content and final QA are applied. Interaction state belongs to 2C.

## 2C — Ecommerce interaction layer
- Product variants
- Image galleries and zoom
- Filters and sorting
- Search/autocomplete and query handling
- Add-to-bag feedback
- Cart quantity/state management
- Wishlist persistence
- Recently viewed
- Related products
- Mobile sticky purchase controls
- Checkout handoff

## 2D — Admin/content experience
- Admin dashboard
- Product and collection management
- Landing-page section editor
- Ecommerce merchandising controls
- Campaign/ad/promotion manager
- Jumia-inspired flash-sale mechanism, implemented in Zorah's own visual language
- Scheduled campaign start/end dates and truthful countdowns
- Draft/published/paused/expired states
- Image/media management
- Journal/news management
- Controlled landing-page content editing and reordering
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
Vercel is intentionally not required during 2A/early 2B. We connect it when the application has enough implemented surface area to benefit from a live preview/deployment environment. I will tell the project owner when that point is reached.
