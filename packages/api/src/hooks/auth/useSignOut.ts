import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getBrowserClient } from '../../client/browser';
import { authQueryKeys, signOut } from '../../queries/auth';

/**
 * Mutation hook to sign out the current user.
 * On success, clears all auth queries from cache.
 */
export function useSignOut() {
  const queryClient = useQueryClient();
  const client = getBrowserClient();

  return useMutation({
    mutationFn: () => signOut(client),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authQueryKeys.all });
    },
  });
}
