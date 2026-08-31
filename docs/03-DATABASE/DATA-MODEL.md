# Data Model

User identity belongs to Supabase Auth; application profile data belongs in `profiles` keyed to the auth user ID.

Catalog hierarchy: categories/collections → products → variants → media. Inventory belongs to sellable variants.

Commerce hierarchy: cart → cart_items; order → order_items; order → payments and delivery address snapshot.

Custom orders are independent requests linked to a customer and may later reference an order. Notifications reference a recipient and event type. Audit logs reference actor, action, resource and metadata.

Use status enums/check constraints where the state machine is finite. Avoid storing repeated derived values unless needed for historical snapshots or performance.