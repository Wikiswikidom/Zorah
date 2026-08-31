# Payments

Paystack is the initial payment provider. Payment state is stored locally and linked to the order and provider transaction/reference.

Never trust the browser's payment-success message. The server verifies provider status and amount before treating an order as paid.

Payment records should support initiated, successful, failed, abandoned, reversed/refunded states as applicable. Monetary values are integer minor units plus currency.

All payment state transitions must be idempotent and auditable.