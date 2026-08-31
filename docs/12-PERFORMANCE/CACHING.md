# Caching

Cache public, relatively stable catalog/content responses where safe. Avoid caching personalized account, cart, payment or sensitive admin data in shared caches.

Invalidate/revalidate content when admins publish important changes. Product price/stock data must be revalidated for checkout even if storefront display data is cached.

Caching strategy should be documented alongside each data access pattern so stale data cannot create financial or inventory errors.