# Threat Model

Primary threats: account takeover, credential stuffing, unauthorized admin access, price manipulation, stock manipulation, payment spoofing, replayed webhooks, malicious uploads, XSS, CSRF, injection, data leakage, abuse of custom-order uploads and denial-of-service.

Trust boundaries exist between browser/provider and server, server and database, server and Paystack, and admin users and privileged functions.

Mitigations: validation, RLS/RBAC, rate limits, secure cookies, CSP, strict upload rules, signed/verified webhooks, server-side payment verification, idempotency, audit logs, least privilege and monitoring.

Threat modeling is revisited when new integrations or privileged workflows are added.