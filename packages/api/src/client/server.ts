/**
 * Supabase server client — for use in Next.js Server Components and API routes.
 * Requires @supabase/ssr to be installed in apps/web.
 *
 * This file uses a dynamic import pattern so that React Native does not need
 * to install @supabase/ssr.
 */

import type { Database } from '@moni/types';
import type { createServerClient as CreateServerClientFn } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';

type CookieStore = {
  getAll: () => { name: string; value: string }[];
  set?: (name: string, value: string, options: CookieOptions) => void;
};

export async function createSupabaseServerClient(cookieStore: CookieStore) {
  const { createServerClient } = (await import('@supabase/ssr')) as {
    createServerClient: typeof CreateServerClientFn;
  };

  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[],
      ) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set?.(name, value, options),
        );
      },
    },
  });
}
