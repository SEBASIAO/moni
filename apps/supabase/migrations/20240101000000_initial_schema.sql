-- Initial schema migration for Moni template
-- Run: supabase db reset (to apply from scratch)
-- or:  supabase migration up (to apply incrementally)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- PROFILES TABLE
-- Extends Supabase auth.users with app-specific data
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade unique,
  full_name  text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index on user_id for fast lookups
create index if not exists profiles_user_id_idx on public.profiles(user_id);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Users can only read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

-- Users can only update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Service role can insert (called from trigger below)
create policy "Service role can insert profiles"
  on public.profiles for insert
  with check (true);

-- ─────────────────────────────────────────────
-- AUTO-CREATE PROFILE ON SIGNUP TRIGGER
-- ─────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────
-- AUTO-UPDATE updated_at TRIGGER
-- ─────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();
