# Migrations

Database changes are version-controlled SQL migrations and applied in deterministic order.

Rules:
- Never edit an already-applied migration in a way that changes production history.
- Prefer additive, backwards-compatible changes before destructive changes.
- Include indexes, constraints, RLS and policies with the migration when required.
- Test migrations against a clean database and a representative existing dataset.
- Destructive changes require a documented migration plan and backup/rollback consideration.
- Seed data must never contain real customer secrets.

Supabase migrations become part of the GitHub source of truth.