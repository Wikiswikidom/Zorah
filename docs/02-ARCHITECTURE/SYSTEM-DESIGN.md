# System Design

Core domains: identity, catalog, inventory, content, cart, wishlist, checkout, payments, orders, delivery, custom orders, notifications, reviews and administration.

The storefront consumes published catalog/content data. The admin portal manages those records through protected server operations. Orders reference immutable commercial snapshots where necessary so later product edits do not rewrite historical transactions.

Payment state is provider-backed but also persisted locally. The order lifecycle is controlled by business rules rather than by arbitrary frontend status changes.

The architecture should favor explicit domain services over deeply coupled UI components, making future testing and maintenance easier.