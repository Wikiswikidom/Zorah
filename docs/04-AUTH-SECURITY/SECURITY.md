# Security Architecture

Security is a release requirement, not a post-launch feature. Use defense in depth across browser, server, database, provider integrations and operational access.

Controls include Supabase RLS, RBAC, secure sessions, input validation, output encoding, CSRF protection where applicable, rate limiting, bot/brute-force controls, MFA for privileged users where supported, secure headers/CSP, HTTPS, secret management, dependency scanning, safe uploads, webhook verification, payment verification, idempotency and audit logging.

Security-sensitive actions must execute on trusted server infrastructure. The browser may request an action but never becomes the authority for price, stock, role, payment success or fulfillment.