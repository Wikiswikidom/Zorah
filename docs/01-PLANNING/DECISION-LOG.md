# Decision Log

## D-001 — Backend
Use Supabase as the primary backend and PostgreSQL system of record. Do not combine Firebase and Supabase for the same core domain.

## D-002 — Frontend
Use Next.js + TypeScript + React with Tailwind CSS, with animation used selectively.

## D-003 — Hosting
Use Vercel for web deployment.

## D-004 — Payments
Use Paystack with server-side initialization and verification.

## D-005 — Fulfilment
Delivery only at launch; no pickup-station workflow.

## D-006 — Admin
Use RBAC rather than one shared admin role.

Future decisions must include date, rationale, alternatives considered and affected documents.