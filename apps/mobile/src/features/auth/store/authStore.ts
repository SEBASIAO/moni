import { create } from 'zustand';

import type { User, Session } from '@moni/types';

interface AuthStore {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
};

/**
 * Zustand store for mobile auth state.
 * Updated by the auth listener in AppProviders.
 */
export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,
  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: session !== null,
    }),
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set(initialState),
}));
