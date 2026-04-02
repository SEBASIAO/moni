'use client';

import { create } from 'zustand';

import type { User } from '@moni/types';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Zustand store for client-side auth state.
 * The source of truth is always Supabase — use this for UI state only.
 */
export const useAuth = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));
