# RLS Strategy

RLS is mandatory on exposed application tables. Public users may read only intentionally public/published catalog and content rows. Authenticated customers may read/write only rows they own. Admin access is granted through a trusted role model and server-side authorization, with database policies enforcing the same boundary.

Never rely on hiding admin UI as security. Never expose service-role credentials to the browser.

Policies must cover SELECT, INSERT, UPDATE and DELETE separately where appropriate. Sensitive tables such as payments, audit logs and role assignments should be especially restrictive.

Every schema migration must include an RLS review and tests for anonymous, customer and each admin role.