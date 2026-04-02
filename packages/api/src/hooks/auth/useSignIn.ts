import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getBrowserClient } from '../../client/browser';
import { authQueryKeys, signIn } from '../../queries/auth';

/**
 * Mutation hook to sign in with email and password.
 * On success, invalidates auth queries so they refetch.
 */
export function useSignIn() {
  const queryClient = useQueryClient();
  const client = getBrowserClient();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      signIn(client, credentials),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
    },
  });
}
