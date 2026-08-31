# Paystack Integration

Transaction initialization occurs server-side using the secret key. The browser receives only the safe information required to continue payment.

On return/webhook, the server verifies the transaction with Paystack and checks reference, status, currency and expected amount before fulfillment. Webhook authenticity must be validated according to Paystack's current API guidance.

Secret keys live only in server environment variables. Test and live credentials are separate. Live mode is not enabled until the production checklist passes.