# Vercel Firewall / WAF Runbook

## Current state

Application-level rate limiting is already implemented in Zorah. Vercel Firewall should be the edge-level second layer.

Vercel Firewall supports custom rules for logging, blocking, challenging, redirecting, and rate limiting. Rule changes are published independently of an application deployment.

## Recommended configuration

### Rule 1 — API edge rate limit

**Name:** `zorah-api-rate-limit`

**Condition:**
- Path starts with `/api/`
- Exclude `/api/paystack/webhook` from the rate-limit rule

**Action:**
- Rate limit
- 120 requests / 60 seconds
- Key: IP + JA4 Digest where available
- Response: HTTP 429

Why 120? The application already has much tighter limits for login, checkout, Paystack initialize/verify, contact, custom-order, waitlist, and admin APIs. This rule is the broad edge safety net rather than the business-logic limiter.

If the project is on Hobby, Vercel currently allows one rate-limit rule per project. If separate thresholds are needed for login/checkout/API, use Pro/Enterprise or keep the stricter endpoint controls in the application layer.

### Rule 2 — deny obvious sensitive-path probes

**Name:** `zorah-deny-sensitive-probes`

Match exact/known paths such as:
- `/.env`
- `/.git/config`
- `/.git/HEAD`
- `/wp-admin`
- `/wp-login.php`
- `/xmlrpc.php`
- `/server-status`

**Action:** Deny

These paths are not part of Zorah and blocking them reduces useless origin traffic.

### Rule 3 — suspicious automation / bot protection

**Name:** `zorah-bot-protection-log`

Start in **Log** mode. Observe:
- login
- checkout
- account
- API traffic
- unusual user agents
- repeated requests from the same IP/JA4

After confirming the traffic is unwanted, move the narrow rule to Challenge or Deny.

Do not block verified search crawlers or Paystack webhook traffic.

## Managed rules

If the Vercel plan supports managed OWASP rulesets, start in Log mode, review matches, then move high-confidence rules to Deny.

Bot Protection / AI Bots managed rules can also be enabled in Log mode first.

## Preview/deployment protection

Keep preview deployments protected. Do not expose a preview deployment publicly when it contains real production data or production credentials.

## Publish and test

After publishing a rule:
1. Open Vercel Firewall → Rules.
2. Confirm the rule is **published**, not draft.
3. Generate controlled traffic from one test IP.
4. Confirm expected 429/deny/challenge behavior.
5. Confirm normal Shop traffic still works.
6. Confirm Paystack webhook requests are not accidentally blocked.
7. Review Firewall events after the test.

## Emergency response

For a live abuse event:
- enable Attack Challenge Mode where appropriate;
- temporarily tighten rate limits;
- block confirmed malicious IPs;
- keep Paystack and trusted monitoring/operations traffic working;
- record the incident and rule change in the security incident log.

## Important

This project cannot configure the user's Vercel Firewall from the connected Vercel project tooling available to this conversation. The exact rules above are therefore the controlled manual configuration to apply in **Vercel → Zorah → Firewall**.

Vercel's current documentation confirms that Firewall custom rules and rate limiting are available, with plan-specific rule limits. Verify the current plan limits shown in the dashboard before publishing.
