# Payment Flow

1. Customer submits checkout.
2. Server validates cart, stock, address and delivery.
3. Server calculates authoritative amount.
4. Server creates a pending order/payment record or equivalent safe transaction state.
5. Server initializes Paystack transaction.
6. Customer completes payment.
7. Server verifies result through trusted provider communication.
8. Payment and order transition exactly once.
9. Inventory/fulfilment effects occur only after confirmed payment.
10. Notification is queued/sent.

Every step must tolerate retries without duplicating orders or stock changes.