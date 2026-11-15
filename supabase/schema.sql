-- BreakMath database. Paste this whole file into Supabase: SQL Editor, New query, Run.
-- Safe to run more than once.

-- One row per account: whether it is on Pro.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  pro boolean not null default false,
  stripe_customer_id text,
  updated_at timestamptz not null default now()
);

-- A saved break. The whole plan (inputs, spots, results) is kept in "data".
create table if not exists public.breaks (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- A saved team list.
create table if not exists public.templates (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists breaks_user_created on public.breaks (user_id, created_at desc);
create index if not exists templates_user_created on public.templates (user_id, created_at desc);

-- Give every new account a profile row.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id) select id from auth.users on conflict (id) do nothing;

-- Is the signed-in account on Pro?
create or replace function public.is_pro()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select pro from public.profiles where id = auth.uid()), false);
$$;

-- How many breaks the signed-in account has saved this calendar month.
create or replace function public.breaks_this_month()
returns integer language sql stable security definer set search_path = public as $$
  select count(*)::integer from public.breaks
  where user_id = auth.uid() and created_at >= date_trunc('month', now());
$$;

alter table public.profiles enable row level security;
alter table public.breaks enable row level security;
alter table public.templates enable row level security;

-- Profiles: people can read their own. Only the Stripe webhook (which uses the
-- service role key and bypasses these rules) can change "pro".
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select using (id = auth.uid());

-- Breaks: people see and change only their own. The free plan may add 3 a month.
drop policy if exists "read own breaks" on public.breaks;
create policy "read own breaks" on public.breaks for select using (user_id = auth.uid());

drop policy if exists "add own breaks within plan" on public.breaks;
create policy "add own breaks within plan" on public.breaks for insert
  with check (user_id = auth.uid() and (public.is_pro() or public.breaks_this_month() < 3));

drop policy if exists "edit own breaks" on public.breaks;
create policy "edit own breaks" on public.breaks for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "delete own breaks" on public.breaks;
create policy "delete own breaks" on public.breaks for delete using (user_id = auth.uid());

-- Templates: saving your own team lists is a Pro feature.
drop policy if exists "read own templates" on public.templates;
create policy "read own templates" on public.templates for select using (user_id = auth.uid());

drop policy if exists "add own templates on pro" on public.templates;
create policy "add own templates on pro" on public.templates for insert
  with check (user_id = auth.uid() and public.is_pro());

drop policy if exists "edit own templates" on public.templates;
create policy "edit own templates" on public.templates for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "delete own templates" on public.templates;
create policy "delete own templates" on public.templates for delete using (user_id = auth.uid());
