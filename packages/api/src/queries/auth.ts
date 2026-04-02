import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@moni/types';

type Client = SupabaseClient<Database>;

export const authQueryKeys = {
  all: ['auth'] as const,
  session: () => [...authQueryKeys.all, 'session'] as const,
  user: () => [...authQueryKeys.all, 'user'] as const,
};

export async function getSession(client: Client) {
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getUser(client: Client) {
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function signIn(
  client: Client,
  credentials: { email: string; password: string },
) {
  const { data, error } = await client.auth.signInWithPassword(credentials);
  if (error) throw error;
  return data;
}

export async function signUp(
  client: Client,
  credentials: { email: string; password: string },
) {
  const { data, error } = await client.auth.signUp(credentials);
  if (error) throw error;
  return data;
}

export async function signOut(client: Client) {
  const { error } = await client.auth.signOut();
  if (error) throw error;
}
