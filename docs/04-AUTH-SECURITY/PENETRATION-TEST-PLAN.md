# Zorah External Penetration Test Plan

## Important distinction

Automated scans and engineering tests are not an independent penetration test.

An independent penetration test should be performed by a security professional or firm that is not responsible for building Zorah and should receive a controlled scope, test accounts, and written authorization.

## Scope

### In scope
- Public storefront
- Authentication
- Customer account
- Cart
- Wishlist
- Checkout
- Order history
- Admin login
- Commerce Studio
- Admin APIs
- Supabase Data API surface exposed by the application
- File/media upload paths
- Paystack integration endpoints once test keys are available
- Vercel production deployment and configured domains

### Out of scope unless separately authorised
- Paystack infrastructure
- Supabase infrastructure
- Vercel infrastructure outside Zorah configuration
- Third-party delivery providers
- Social/advertising platforms
- Denial-of-service testing
- Destructive data deletion

## Test accounts

Create controlled accounts with:
- Customer A
- Customer B
- Super Admin
- Catalogue Manager
- Orders Manager
- Support Manager

Never use a real customer's password or private data for penetration testing.

## Required attack categories

- Broken access control / IDOR / BOLA
- Authentication and session attacks
- MFA bypass
- Privilege escalation
- CSRF
- XSS
- SQL/NoSQL injection
- SSRF
- File upload abuse
- Path traversal
- Open redirects
- Request smuggling
- HTTP method tampering
- Rate-limit bypass
- Race conditions
- Business-logic abuse
- Coupon/campaign abuse
- Cart manipulation
- Price/quantity tampering
- Inventory race
- Order status manipulation
- Payment reference/amount manipulation
- Webhook replay/signature bypass
- Sensitive data exposure
- Cache poisoning/mis-caching
- Security-header/CSP bypass
- Dependency/supply-chain issues

## Evidence required

For each finding:
- endpoint
- HTTP method
- preconditions
- exact reproduction steps
- impact
- severity
- evidence
- remediation
- retest result

## Release gate

Do not describe Zorah as having passed an independent penetration test until:
1. the external tester completes the agreed scope;
2. critical/high findings are remediated or formally accepted by management;
3. fixes are retested;
4. the final report is retained as evidence.

## Current engineering status

- Staff MFA: implemented
- RLS/MFA boundary: implemented and tested
- CSRF boundary: implemented
- Application rate limiting: implemented
- Security headers: implemented
- OWASP ZAP baseline: automated workflow added
- Authenticated E2E: requires controlled test accounts and execution
- Paystack transaction testing: waiting for company test/production credentials
- Independent external test: pending external tester
