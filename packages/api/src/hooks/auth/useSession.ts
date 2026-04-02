import { useQuery } from '@tanstack/react-query';

import { getBrowserClient } from '../../client/browser';
import { authQueryKeys, getSession } from '../../queries/auth';

/**
 * Returns the current Supabase session.
 * Works in both React Native and Next.js client components.
 */
export function useSession() {
  const client = getBrowserClient();

  return useQuery({
    queryKey: authQueryKeys.session(),
    queryFn: () => getSession(client),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
