# Phase 2D-9 — Scheduling & Publishing Automation

## Status
Implementation complete; production browser/build verification remains a deployment gate.

## Implemented
- `publishing_jobs` queue with pending/processing/completed/failed/cancelled lifecycle.
- Supported scheduled resources: products, landing sections, campaigns and journal articles.
- Server-time execution using PostgreSQL `now()`.
- Retry handling with a three-attempt failure boundary.
- Database function `private.process_scheduled_content()` for automated publishing and campaign expiry.
- Supabase `pg_cron` job `zorah-process-scheduled-content` scheduled every minute.
- Authorized admin fallback endpoint: `POST /api/admin/scheduling/process`.
- Scheduling operations are role-gated and protected by RLS.
- Campaign start/end windows are enforced server-side; expired campaigns stop being live.

## Safety boundaries
- CMS content remains controlled-block data; no arbitrary HTML/JavaScript execution.
- Scheduling never changes payment/order state.
- Campaign discount metadata is not trusted as a checkout price; final promotional pricing must be independently calculated during the later commerce/payment phase.
- The admin processing endpoint requires an authenticated permitted staff role.

## Operational acceptance tests
1. Create a future publishing job and confirm it remains `pending` before `run_at`.
2. Run the authorized processing endpoint/function after `run_at` and confirm the resource changes state.
3. Confirm completed jobs receive `processed_at`.
4. Force a failing job and confirm retry/failed behaviour after three attempts.
5. Confirm an expired campaign transitions away from `live`.
6. Confirm an unauthorized role cannot execute the processing RPC.
7. Confirm public queries only expose content permitted by the existing publication/RLS policies.
8. Confirm the cron job exists and runs every minute in the production Supabase project.
