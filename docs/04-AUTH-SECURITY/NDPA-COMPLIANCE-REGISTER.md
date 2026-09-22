# Zorah NDPA / NDPC Compliance Register

**Purpose:** operational checklist for the company/legal owner of Zorah. This document does not certify legal compliance.

## Current regulatory basis

The primary Nigerian privacy baseline is the Nigeria Data Protection Act 2023 and the NDPC Nigeria Data Protection Act General Application and Implementation Directive (NDP Act-GAID) 2025.

Official sources:
- https://ndpc.gov.ng/
- https://ndpc.gov.ng/wp-content/uploads/2025/07/NDP-ACT-GAID-2025-MARCH-20TH.pdf

## 1. Determine Zorah's regulatory classification

- [ ] Identify the legal entity operating Zorah.
- [ ] Identify whether Zorah is a data controller, processor, or both.
- [ ] Inventory processing volume, data categories, affected data subjects, technology, and cross-border processing.
- [ ] Determine whether the business is a Data Controller/Processor of Major Importance (DCPMI) and which applicable level.
- [ ] Record the determination and legal adviser/qualified privacy professional responsible.

**Do not assume DCPMI status from the website alone.**

## 2. Registration and recurring compliance

If the company is designated as a DCPMI:

- [ ] Complete applicable NDPC registration.
- [ ] Track registration renewal requirements for the applicable classification.
- [ ] Track NDP Act compliance audit obligations.
- [ ] Track Compliance Audit Returns (CAR) obligations where applicable.
- [ ] Maintain evidence of filings, certificates, audit reports, and correspondence.

GAID 2025 states that DCPMIs must register and describes different registration/CAR treatment for UHL, EHL, and OHL classifications.

## 3. Governance

- [ ] Appoint a DPO where required.
- [ ] Assign a privacy owner/privacy champion for day-to-day operations.
- [ ] Define who approves new processing activities.
- [ ] Define who handles data-subject requests.
- [ ] Define who coordinates privacy/security incidents.
- [ ] Maintain a processor/vendor register.

## 4. Data inventory

Maintain a living record of:

| Data | Purpose | Source | Lawful basis | System | Retention | Access |
|---|---|---|---|---|---|---|
| Name | Account/order fulfilment | Customer | Legal basis to be documented | Supabase | Company policy | Customer/staff as required |
| Email | Account/order communication | Customer | Legal basis to be documented | Supabase/email provider | Company policy | Customer/staff as required |
| Phone | Delivery/support | Customer | Legal basis to be documented | Supabase/operations | Company policy | Operations/support |
| Address | Delivery | Customer | Legal basis to be documented | Supabase | Company policy | Operations |
| Order/payment records | Commerce/accounting | Customer/payment provider | Legal basis to be documented | Supabase/Paystack | Legal/business policy | Restricted staff |

This table is a starting inventory, not a substitute for a formal record of processing.

## 5. Privacy notice and data-subject rights

The public website should publish a clear privacy notice before production launch and provide a working contact/request path for applicable rights.

Track processes for:
- [ ] access
- [ ] rectification
- [ ] objection
- [ ] restriction
- [ ] portability
- [ ] deletion/erasure where applicable
- [ ] complaint/escalation to NDPC
- [ ] automated decision-making rights where applicable

The request process must verify the requester before disclosing or changing personal data.

## 6. Retention and deletion

- [ ] Define retention periods by data category.
- [ ] Define legal holds and accounting requirements.
- [ ] Define deletion/anonymisation rules.
- [ ] Document backup deletion/expiry behavior.
- [ ] Test customer deletion/anonymisation procedures.
- [ ] Do not retain payment card data.

## 7. Security and incident response

- [ ] Maintain access control and MFA for privileged staff.
- [ ] Maintain audit logs.
- [ ] Maintain encryption/TLS.
- [ ] Maintain backup and recovery procedures.
- [ ] Maintain vulnerability/dependency management.
- [ ] Maintain an incident-response owner and escalation list.
- [ ] Determine the applicable legal notification thresholds and deadlines with the company's privacy/legal adviser.
- [ ] Maintain an evidence-preservation procedure.

## 8. Vendors and cross-border processing

For each processor/vendor (hosting, database, email, analytics, payment, delivery, support):

- [ ] Record vendor and processing purpose.
- [ ] Identify where data is stored/processed.
- [ ] Review contractual data-protection terms.
- [ ] Review security posture.
- [ ] Determine whether cross-border transfer rules apply.
- [ ] Record the transfer mechanism/assessment where required.
- [ ] Review vendors at least annually and after material changes.

## 9. DPIA

Run a documented DPIA where required by the NDPA/GAID or where processing presents the relevant high-risk characteristics.

Zorah should at minimum assess:
- large-scale customer profiling/analytics if introduced
- automated decision-making if introduced
- large-scale sensitive data processing if introduced
- new biometric/identity technology if introduced
- major new tracking/advertising systems
- material changes in cross-border processing

## 10. Evidence pack for launch

Before legal/compliance sign-off, retain:

- [ ] Privacy notice
- [ ] Terms and conditions
- [ ] Data inventory / records of processing
- [ ] Retention schedule
- [ ] Data-subject request procedure
- [ ] Vendor/processor register
- [ ] Cross-border transfer assessment where applicable
- [ ] DPIA where required
- [ ] DPO appointment where required
- [ ] NDPC registration evidence where applicable
- [ ] Audit/CAR evidence where applicable
- [ ] Incident-response plan
- [ ] Security test reports
- [ ] Staff privacy/security training evidence

**Status:** Engineering can prepare the controls and evidence structure, but company management/legal/privacy professionals must make the legal determinations and complete registrations/filings.
