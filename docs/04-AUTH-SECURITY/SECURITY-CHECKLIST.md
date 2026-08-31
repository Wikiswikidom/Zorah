# Security Checklist

- [ ] No secrets committed to GitHub.
- [ ] Public env variables contain only intentionally public values.
- [ ] RLS enabled and tested on exposed tables.
- [ ] Customer ownership policies tested.
- [ ] Admin RBAC tested per role.
- [ ] Password reset and email verification tested.
- [ ] Rate limiting/brute-force controls tested.
- [ ] Payment initialization and verification server-side.
- [ ] Paystack webhook signature verified.
- [ ] Idempotency implemented for payment/order effects.
- [ ] Upload MIME/type/size validation enforced.
- [ ] CSP/security headers reviewed.
- [ ] Dependencies scanned.
- [ ] Audit logs cover privileged mutations.
- [ ] Production HTTPS and environment separation verified.