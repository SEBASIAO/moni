-- Seed data for local development
-- Applied by `supabase db reset` after migrations

-- Create a demo user (Supabase auth.users)
insert into auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  role,
  aud
) values (
  'a0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'demo@moni.co',
  crypt('Demo1234!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Demo User"}',
  'authenticated',
  'authenticated'
) on conflict (id) do nothing;

-- The profile is created automatically by the handle_new_user trigger.
-- You can add additional seed data here as the schema grows.
