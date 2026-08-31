# Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| Poor mobile performance | High | Responsive images, limited JS, caching, performance budgets |
| Payment duplication/fraud | Critical | Server verification, amount checks, webhook verification, idempotency |
| Incorrect stock | High | Transactional inventory logic and explicit reservation/fulfilment rules |
| Admin privilege abuse | Critical | RBAC, RLS, MFA where supported, audit logs, least privilege |
| Bad product content | High | CMS validation, content checklist and photography standards |
| Custom-order complexity | Medium | Explicit status/quote workflow and data model |
| SEO duplication | Medium | canonical URLs, metadata, sitemap and indexation rules |
| Provider outage | Medium | Clear error states, retries where safe and operational monitoring |
| Scope creep | High | Decision log, open questions and phase gates |

Security and payment risks are release blockers.