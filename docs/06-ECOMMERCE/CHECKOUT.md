# Checkout

Flow: cart review → delivery address → delivery option/price → order summary → Paystack → payment result → order confirmation.

Before payment initialization, the server recalculates item prices, validates stock, validates delivery eligibility and calculates the total. The client cannot supply the authoritative total.

Checkout must handle payment cancellation, failure, timeout, duplicate callbacks and successful return gracefully. The customer should receive a stable order reference after a confirmed transaction.

Avoid unnecessary form fields and optimize for Nigerian mobile users.