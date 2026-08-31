# Email

Transactional email should use a verified Zorah sending domain and provider with server-side API credentials.

Templates: welcome, email verification, password reset, order confirmation, payment result, order status, shipment, delivery, custom-order updates and approved promotional messages.

Emails must be responsive, accessible and branded without depending on external assets that may be blocked. Avoid putting secrets or excessive personal/payment information into messages.

Provider failure should be observable and retryable.