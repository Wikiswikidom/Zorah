# Environment Management

Environment categories: local development, preview/staging and production.

Never commit `.env` secrets. Public browser variables must be intentionally public. Supabase service-role credentials, Paystack secret keys, email provider secrets and signing keys remain server-only.

Preview and production must use separate credentials/resources where provider policy supports it. Document variable names, not secret values.

Rotate credentials after accidental exposure and maintain ownership of all production accounts under the business.