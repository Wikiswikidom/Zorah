# Notifications

Notifications are event-driven. Business events such as order placement, payment success, shipping and custom-order updates create notification intents rather than UI-specific messages.

Channels initially include email and in-app notifications. SMS/WhatsApp may be added later behind the same event model.

Notification delivery must be retryable and idempotent. A failed email should not roll back a successful order.

Customers can manage non-essential notification preferences; mandatory transactional notices remain governed by business/legal requirements.