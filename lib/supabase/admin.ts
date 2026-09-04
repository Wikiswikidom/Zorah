import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client for tightly controlled administrative operations.
 * Never import this module from client components or expose the service key.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase server environment variables.')
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
