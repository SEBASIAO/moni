import { createClient } from '@supabase/supabase-js';

import type { Database } from '@moni/types';

/**
 * Supabase browser client — safe to use in React Native and web client components.
 * Reads credentials from environment variables.
 */
export function createBrowserClient() {
  const supabaseUrl = process.env['SUPABASE_URL'] ?? process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseAnonKey =
    process.env['SUPABASE_ANON_KEY'] ?? process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY are required.',
    );
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

/** Singleton browser client instance */
let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function getBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient();
  }
  return browserClient;
}
