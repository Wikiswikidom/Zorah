# Database Architecture

PostgreSQL is the source of truth for transactional data. Tables should use UUID primary keys unless a domain-specific public identifier is needed. Monetary values should use integer minor units plus currency, avoiding floating-point arithmetic.

Core entities include profiles, roles, permissions, addresses, products, product_variants, product_media, categories, collections, inventory, carts, cart_items, wishlists, orders, order_items, payments, delivery_rules, custom_orders, custom_order_events, reviews, content_entries, promotions, notifications and audit_logs.

Historical order data must remain stable even when catalog data changes. Foreign keys, unique constraints, check constraints and indexes should enforce invariants at database level.