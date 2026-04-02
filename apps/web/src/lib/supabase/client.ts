import { createBrowserClient as createBrowserClientFn } from '@supabase/ssr';

import type { Database } from '@moni/types';

/**
 * Browser-side Supabase client for use in Client Components.
 * Singleton pattern — safe to call multiple times.
 */
export function createClient() {
  return createBrowserClientFn<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
  );
}
