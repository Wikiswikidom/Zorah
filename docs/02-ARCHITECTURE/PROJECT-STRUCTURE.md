# Project Structure

Planned high-level structure:

- `app/` — routes, layouts and server/client boundaries.
- `components/` — reusable UI components.
- `features/` — domain-focused application modules.
- `lib/` — shared utilities, Supabase clients, validation and configuration.
- `server/` — trusted server-side services and integrations.
- `supabase/` — migrations, seed data and database policies.
- `public/` — static assets that do not belong in object storage.
- `tests/` — unit/integration/E2E support.
- `docs/` — project source-of-truth documentation.

Exact structure can be adjusted during Phase 3 if it improves maintainability, but security boundaries must remain explicit.