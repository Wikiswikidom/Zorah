# Zorah Stage 10 — Security & Compliance Baseline

## Scope

This baseline applies to the Zorah storefront, customer accounts, Commerce Studio, Supabase database/storage, Vercel deployment, Paystack integration and operational processes.

The technical target is OWASP ASVS 5.0 Level 2 for a sensitive ecommerce application, with selected Level 3 controls for staff/admin access and payment/inventory operations. OWASP ASVS is a verification standard; OWASP Top 10:2025 is an awareness baseline, not a certification.

## Nigerian requirements

### 1. Nigeria Data Protection Act 2023 + NDPC GAID 2025 — mandatory where applicable

Zorah processes names, email addresses, phone numbers, addresses, account data and order history. The company must determine its legal role and whether it is a data controller/processor of major importance, then complete the applicable NDPC registration/audit/DPO obligations.

Technical controls implemented here:
- least-privilege database access
- RLS on public tables
- private customer records
- staff MFA
- audit logging
- HTTPS/HSTS
- secure secret handling
- privacy/terms pages
- breach-response process
- data minimization in security logs

Operational controls still belong to the company:
- lawful-basis/data-processing inventory
- retention schedule
- DPO/DPCO decisions
- DPIA where required
- data-subject access/rectification/erasure processes
- processor agreements
- NDPC registration/compliance audit returns where applicable
- qualifying breach notification within the statutory timeframe

### 2. Cybercrimes (Prohibition, Prevention, etc.) Act 2024

Zorah must maintain controls against unauthorized access, interception, fraud, system interference and other cybercrime risks. The platform's authentication, least privilege, RLS, logging, MFA and incident response controls support this requirement.

The Act is a legal obligation, not a software certification. Legal/compliance counsel should confirm any sector-specific duties that apply to the company.

### 3. PCI DSS v4.0.1 — conditional but essential for the payment channel

Zorah must not store card numbers, CVV or sensitive authentication data.

The intended architecture sends payment processing to Paystack and verifies payment server-side. The final PCI validation scope depends on the exact Paystack integration and the merchant/acquirer. If the merchant qualifies for SAQ A, PCI SSC still has eligibility and scanning requirements that must be satisfied.

Do not claim PCI compliance until the company completes the appropriate SAQ/assessment and has the required evidence.

## Conditional / optional frameworks

- ISO/IEC 27001 — optional certification for an information security management system.
- ISO/IEC 27701 — optional privacy information management extension.
- SOC 2 — optional assurance report; generally more relevant when selling a SaaS/service to enterprise customers.
- NIST CSF 2.0 — useful risk-management framework, not a Nigerian legal certification.
- GDPR/UK GDPR — conditional if Zorah targets or otherwise processes covered data subjects under those regimes.
- CBN payment regulations — sector-specific; Zorah should not present itself as a regulated payment service provider merely because it uses Paystack. Paystack/acquirer obligations and the merchant's own obligations must be confirmed separately.

## Production gates

A production release is not considered security-cleared until:
1. Vercel deployment is READY.
2. Security smoke tests pass.
3. npm audit --audit-level=high passes.
4. TypeScript and ESLint pass.
5. Admin APIs return 401/403 without valid staff authorization.
6. Staff authorization requires verified MFA.
7. RLS tests show staff AAL1 cannot reach staff-managed data.
8. Customer-owned data remains isolated.
9. Payment webhooks remain signature-verified and idempotent.
10. No production secrets are committed to Git.
11. Paystack production keys are configured only when the company is ready to test live payment flows.
12. An external vulnerability scan/penetration test is completed before public launch.

## Residual controls requiring company/platform action

- Enable Supabase leaked-password protection.
- Enable/verify Supabase MFA settings for the project.
- Configure Vercel WAF/rate limits for public abuse protection.
- Configure monitoring/alerting and an incident contact.
- Complete NDPC organizational compliance obligations.
- Obtain the appropriate PCI DSS validation evidence.
- Perform an independent penetration test before launch.
