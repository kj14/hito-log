-- Create extension for UUID generation if not exists
create extension if not exists "pgcrypto";

-- Domain enums
create type public.sex as enum ('male', 'female', 'other', 'unspecified');

-- Base profile for a workspace
create table if not exists public.life_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_token uuid not null unique,
  name text not null,
  birth_date date not null,
  life_expectancy_years numeric(5,2) not null check (life_expectancy_years > 0),
  sex public.sex default 'unspecified' not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists life_profiles_profile_token_idx on public.life_profiles(profile_token);

-- People related to the profile
create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.life_profiles(id) on delete cascade,
  name text not null,
  birth_date date not null,
  life_expectancy_years numeric(5,2) not null check (life_expectancy_years > 0),
  meeting_interval_days integer not null check (meeting_interval_days > 0),
  average_session_minutes integer not null check (average_session_minutes > 0),
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists relationships_profile_id_idx on public.relationships(profile_id);

-- Goals owned by the profile
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.life_profiles(id) on delete cascade,
  title text not null,
  category text,
  target_effort_hours numeric(6,2) not null check (target_effort_hours >= 0),
  target_date date not null,
  motivation_note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists goals_profile_id_idx on public.goals(profile_id);

-- Logged time entries for each goal
create table if not exists public.goal_logs (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  logged_at timestamptz not null default timezone('utc', now()),
  minutes integer not null check (minutes >= 0),
  note text
);

create index if not exists goal_logs_goal_id_idx on public.goal_logs(goal_id);

-- Trigger function to maintain updated_at timestamps
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger set_updated_at_life_profiles
  before update on public.life_profiles
  for each row
  execute function public.set_updated_at();

create trigger set_updated_at_relationships
  before update on public.relationships
  for each row
  execute function public.set_updated_at();

create trigger set_updated_at_goals
  before update on public.goals
  for each row
  execute function public.set_updated_at();
