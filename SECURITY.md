# Zorah Security Policy

## Security objectives

Zorah protects customer accounts, staff access, personal data, order/payment integrity, inventory and merchant operations using defense in depth:

- Supabase Auth and server-side session verification
- Row Level Security (RLS)
- least-privilege staff roles
- mandatory TOTP MFA for Commerce Studio staff
- server-only secret keys
- Paystack signature verification and server-side payment verification
- atomic paid-order inventory fulfillment
- CSRF origin enforcement for state-changing requests
- secure HTTP response headers and private-page no-store caching
- input length/type validation and anti-automation controls
- audit logging for sensitive merchant operations
- production security smoke tests and dependency auditing

## Reporting

Do not disclose a suspected vulnerability publicly before Zorah has had an opportunity to investigate and remediate it. Report suspected vulnerabilities privately to the company's designated security contact.

Never include passwords, API secrets, payment card data or live session tokens in a report.

## Incident response

A confirmed personal-data breach is handled under the Nigeria Data Protection Act 2023 and applicable NDPC directives, including the applicable 72-hour notification requirement for qualifying breaches. The incident process must preserve evidence, contain access, rotate affected secrets, assess affected data subjects, remediate the root cause and document notifications.

## Production rules

- Never place Supabase secret/service-role keys or Paystack secret keys in client code.
- Never store card numbers, CVV or other sensitive authentication data in Zorah.
- Staff must use MFA.
- Production database changes must be represented by migrations.
- Security-sensitive changes require deployment verification and rollback readiness.
