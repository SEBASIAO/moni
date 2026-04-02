import { useSignIn } from '@moni/api/hooks';
import { useAuthStore } from '../store/authStore';

/**
 * Mobile login hook.
 * Wraps the shared useSignIn mutation and updates the local auth store.
 */
export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);

  const mutation = useSignIn();

  async function login(email: string, password: string) {
    const result = await mutation.mutateAsync({ email, password });
    if (result.session) {
      // Map Supabase session to our Session type
      setSession({
        accessToken: result.session.access_token,
        refreshToken: result.session.refresh_token,
        expiresAt: result.session.expires_at ?? 0,
        user: {
          id: result.session.user.id,
          email: result.session.user.email ?? '',
          createdAt: result.session.user.created_at,
          updatedAt: result.session.user.updated_at ?? result.session.user.created_at,
        },
      });
    }
  }

  return {
    login,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
