import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client for tightly controlled administrative operations.
 * Never import this module from client components or expose the secret key.
 *
 * SUPABASE_SECRET_KEY is the current Supabase server key. The legacy
 * SUPABASE_SERVICE_ROLE_KEY is retained as a fallback during the 2026 key
 * migration so existing deployments continue to work.
 */
export function createAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY
  const legacyServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const key = secretKey ?? legacyServiceKey

  if (!url || !key) {
    throw new Error(
      'Missing Supabase server environment variables. Set SUPABASE_SECRET_KEY (preferred) or SUPABASE_SERVICE_ROLE_KEY.'
    )
  }

  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
