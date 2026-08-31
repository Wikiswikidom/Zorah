# Ecommerce Architecture

Commerce consists of catalog discovery, product detail, wishlist, cart, checkout, payment, order management and post-purchase communication.

Prices, stock and availability shown at checkout must be validated server-side against current data. Client state is a convenience, not the source of truth.

The storefront should support both editorial discovery and transactional efficiency: users can arrive through the landing page and quickly reach a product, while shoppers can search/filter directly.

Order creation occurs only after trusted payment/order validation according to the final payment policy.