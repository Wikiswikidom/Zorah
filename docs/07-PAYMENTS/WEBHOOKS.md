# Webhooks

Webhook endpoints are public network endpoints and must treat every payload as untrusted. Validate signature/authenticity, parse safely, validate event type and reference, then perform an idempotent state transition.

Store provider event identifiers where available to prevent replay. Respond appropriately and avoid long-running work inside the request if an asynchronous job mechanism is introduced.

Webhook logs must not contain secrets or unnecessary payment/customer data.

Webhook behavior must be tested with duplicate, delayed, out-of-order and invalid events.