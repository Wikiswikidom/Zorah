# Phase 2D-2 — Setup Checklist

## Supabase project
- [x] Zorah Supabase project exists.
- [x] `public.profiles` created.
- [x] Customer default role enforced.
- [x] RLS enabled and forced on profiles.
- [x] Security-definer helper RPC exposure removed.
- [ ] Configure Site URL for the final deployment domain.
- [ ] Enable Google provider.
- [ ] Add production and development OAuth callback URLs.
- [ ] Configure email confirmation/recovery templates.

## Environment
Set these variables without committing secrets:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Secret/service keys must remain server-only.

## First administrator
1. Create the administrator account normally.
2. Confirm the email if enabled.
3. Verify the profile row exists.
4. Owner assigns `super_admin` manually in the trusted Supabase SQL Editor.
5. Test `/admin` with the account.
6. Test that a normal customer cannot access `/admin`.

## Never do
- Never expose secret/service keys with `NEXT_PUBLIC_`.
- Never put secrets in GitHub.
- Never allow signup to select a role.
- Never trust role data from forms, query strings or localStorage.
- Never expose security-definer role helpers through public RPC.
- Never use frontend-only route guards as the security boundary.

## QA gate
- Login/logout.
- Signup/email confirmation.
- Password recovery.
- Google OAuth.
- Session refresh.
- Customer profile isolation.
- Admin route protection.
- Role isolation.
- Direct-request authorization.
- Open-redirect testing.
- Cache/session-leak testing.
- Supabase security advisor clean.
