# Relationships

One profile can own many addresses, orders, carts, wishlists, custom orders, reviews and notifications.

One product can have many variants and media; variants can have inventory records and order-item references.

Orders have many order items and payment records; order items reference the purchased variant but also store product-name/SKU/price snapshots.

Collections and categories can contain many products through join tables.

Custom orders have many timeline events and may be converted into an order after approval.

All customer-owned relationships must be protected by ownership policies. Admin relationships must be governed by role policies.