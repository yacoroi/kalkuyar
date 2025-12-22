-- Create table to store archived leaderboard rankings
create table if not exists public.leaderboard_history (
    id uuid default gen_random_uuid() primary key,
    period_name text not null, -- e.g. "Aralık 2025" or custom name
    archived_at timestamptz default timezone('utc'::text, now()) not null,
    
    -- Snapshot of user data at the time of archive
    user_id uuid references public.profiles(id) on delete set null,
    full_name text,
    avatar_url text,
    district text,
    neighborhood text,
    points integer not null,
    rank integer not null -- The rank they held at archive time
);

-- Enable RLS
alter table public.leaderboard_history enable row level security;

-- Policies
-- Admin can do everything? For now, public read is fine for history if needed, but let's restrict write to service_role or admin.
-- Reading: Authenticated users can read leaderboard history? Yes.
drop policy if exists "Authenticated users can read leaderboard history" on public.leaderboard_history;

create policy "Authenticated users can read leaderboard history"
    on public.leaderboard_history for select
    to authenticated
    using (true);

-- Archive and Reset RPC
-- This function will:
-- 1. Calculate current ranks for all users with points > 0
-- 2. Insert them into leaderboard_history
-- 3. Reset all points to 0 in profiles
create or replace function public.archive_and_reset_season(p_period_name text)
returns void
language plpgsql
security definer -- Runs as database owner to bypass RLS for mass update
as $$
begin
    -- 1. Insert snapshot into history
    -- We calculate rank on the fly using window function
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
        rank() over (order by points desc) as rank -- 1, 1, 3 etc. same logic as app
    from public.profiles
    where points > 0;

    -- 2. Reset points
    update public.profiles
    set points = 0;

end;
$$;

GRANT EXECUTE ON FUNCTION public.archive_and_reset_season(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.archive_and_reset_season(text) TO service_role;
