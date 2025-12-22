-- Fix RLS to allow public access to history (since Admin panel might be using anon key)
drop policy if exists "Authenticated users can read leaderboard history" on public.leaderboard_history;

create policy "Public read access to leaderboard history"
    on public.leaderboard_history for select
    to anon, authenticated
    using (true);

-- Ensure RLS is enabled
alter table public.leaderboard_history enable row level security;
