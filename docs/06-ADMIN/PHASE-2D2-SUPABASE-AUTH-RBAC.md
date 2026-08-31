# Phase 2D-2 — Supabase Authentication & RBAC

## Status
**Implementation started — backend foundation established.**

## Purpose
Provide Zorah with secure customer authentication and a server-enforced administration boundary. Supabase is the source of truth for identity, roles and database authorization.

## Architecture
`Browser → Next.js SSR → Supabase Auth → profiles/RBAC → PostgreSQL RLS`

Customer authentication:
- Email/password.
- Google OAuth.
- PKCE/OAuth callback.
- Server-managed SSR session cookies using `@supabase/ssr`.

## Roles
- `customer`
- `super_admin`
- `catalog_admin`
- `order_admin`
- `content_admin`
- `marketing_admin`
- `support_admin`
- `analytics_admin`

`super_admin` may act across staff capabilities. Role assignment is privileged and must never be controlled by a browser-supplied value.

## Database foundation
`public.profiles` is linked one-to-one to `auth.users` and contains id, full_name, phone, avatar_url, role, is_active, created_at and updated_at.

New Auth users receive a customer profile through a database trigger. The trigger is SECURITY DEFINER but its execute privilege is revoked from API roles so it cannot be called through the exposed REST RPC surface.

## RLS policy principles
- RLS is enabled and forced on `profiles`.
- Customers can read/update their own permitted profile fields.
- Customers cannot promote themselves, activate themselves, or change their role.
- Staff visibility is controlled server-side and by RLS.
- Future commerce tables must default to deny-by-policy and add narrowly scoped policies.
- Never rely on hidden buttons or client-side role checks as authorization.

## Server authorization
`lib/auth/authorization.ts` provides `getAuthenticatedUser()`, `requireStaff()` and `requireRole()`.

The server uses Supabase `getUser()` when a current Auth-server-confirmed identity is required. The SSR implementation uses a request-aware server client and session refresh proxy.

## Session security
- SSR sessions use Supabase's `@supabase/ssr` cookie integration.
- Next.js `proxy.ts` refreshes Auth state.
- Do not use a client-controlled role claim for authorization.
- Do not trust raw `getSession()` user data for server authorization.
- Do not cache authenticated responses in a way that can leak one user's session to another.
- Do not place service/secret keys in browser variables.

## Google OAuth configuration
Supabase Dashboard must have Google provider enabled.

The application expects `NEXT_PUBLIC_SITE_URL`.

Production callback: `https://<production-domain>/auth/callback`

The callback exchanges the OAuth code server-side and only accepts local relative `next` paths to prevent open redirects.

## Environment variables
Public:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Never commit `.env.local` or secret keys.

## Admin bootstrap
The first real Super Admin must be assigned deliberately by the project owner through a trusted Supabase SQL/admin workflow after that user's Auth account exists. Public signup must never create a staff role.

Example owner-only bootstrap operation:

```sql
update public.profiles p
set role = 'super_admin', is_active = true
from auth.users u
where p.id = u.id
  and u.email = 'YOUR-ADMIN-EMAIL@example.com';
```

This must never be exposed as a website endpoint.

## Threats addressed
- Privilege escalation.
- IDOR through future admin endpoints.
- Forged/modified client role state.
- Open redirects in OAuth callback.
- Unauthorized profile mutation.
- Direct RPC execution of security-definer helpers.
- Session leakage through unsafe caching.
- Accidental exposure of service secrets.

## Remaining 2D-2 work
- Configure Google provider and redirect URLs in Supabase.
- Add password recovery/email confirmation UX.
- Add admin MFA policy when the chosen Supabase Auth configuration supports it.
- Add role-specific server guards as each admin module is implemented.
- Generate typed database definitions after the commerce schema is established.
- Add automated auth/RBAC tests in the QA phase.

## Acceptance criteria
2D-2 is complete only when:
1. Email authentication works.
2. Google authentication works.
3. OAuth callback cannot redirect to an external attacker-controlled URL.
4. `/admin` rejects unauthenticated users.
5. Authenticated customers cannot access staff data or staff actions.
6. Customers cannot change their own role or active state.
7. Staff capabilities are enforced server-side.
8. RLS denies unauthorized database access.
9. Security-definer helper functions are not exposed to anonymous/authenticated RPC execution.
10. Authenticated responses cannot be cross-user cached.
11. Secrets never reach the client bundle or Git history.
12. Automated tests cover authentication, authorization, privilege escalation and direct-request abuse.
