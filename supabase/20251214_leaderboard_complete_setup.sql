-- LEADERBOARD COMPLETE SETUP SCRIPT
-- This script handles Table, Policies, Permissions, and RPC Function in one go.
-- Safe to run multiple times.

-- 1. Create table
create table if not exists public.leaderboard_history (
    id uuid default gen_random_uuid() primary key,
    period_name text not null,
    archived_at timestamptz default timezone('utc'::text, now()) not null,
    user_id uuid references public.profiles(id) on delete set null,
    full_name text,
    avatar_url text,
    district text,
    neighborhood text,
    points integer not null,
    rank integer not null
);

-- 2. Enable RLS
alter table public.leaderboard_history enable row level security;

-- 3. Create Policies (Idempotent)
drop policy if exists "Authenticated users can read leaderboard history" on public.leaderboard_history;
create policy "Authenticated users can read leaderboard history"
    on public.leaderboard_history for select
    to authenticated
    using (true);

-- 4. Create RPC Function
-- Drop first to ensure signature updates
drop function if exists public.archive_and_reset_season(text);

create or replace function public.archive_and_reset_season(p_period_name text)
returns void
language plpgsql
security definer
as $$
begin
    -- Insert snapshot
    insert into public.leaderboard_history (
        period_name,
        user_id,
        full_name,
        avatar_url,
        district,
        neighborhood,
        points,
        rank
    )
    select 
        p_period_name,
        id,
        full_name,
        avatar_url,
        district,
        neighborhood,
        points,
        rank() over (order by points desc)::integer
    from public.profiles
    where points > 0;

    -- Reset points
    update public.profiles
    set points = 0
    where points > 0;
end;
$$;

-- 5. Grant Permissions (Essential for 400/401 errors)
grant execute on function public.archive_and_reset_season(text) to authenticated;
grant execute on function public.archive_and_reset_season(text) to service_role;
grant execute on function public.archive_and_reset_season(text) to postgres;

-- 6. Reload Schema Cache
notify pgrst, 'reload schema';
