-- 1. Create News Table
create table if not exists public.news (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    url text not null unique,
    image_url text,
    summary text,
    published_at timestamptz default timezone('utc'::text, now()) not null,
    created_at timestamptz default timezone('utc'::text, now()) not null,
    is_active boolean default true
);

-- 2. Enable RLS
alter table public.news enable row level security;

-- 3. Create RLS Policies
-- Public (Anon) can read active news
drop policy if exists "Public can read active news" on public.news;
create policy "Public can read active news"
    on public.news for select
    to anon, authenticated
    using (is_active = true);

-- Admin can do everything
drop policy if exists "Admins can manage news" on public.news;
create policy "Admins can manage news"
    on public.news for all
    to authenticated
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role in ('admin', 'district_head')
        )
    );

-- 4. Enable Extensions for Automation (Run this in Supabase Dashboard if strict)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 5. Schedule Job (Example - User must enable via Dashboard if specific privs needed)
-- This assumes the function URL. We will provide a specific script for the user to run once they deploy the function.
-- select cron.schedule('daily-news-fetch', '0 14 * * *', $$
--     select net.http_post(
--         url:='https://<PROJECT_REF>.supabase.co/functions/v1/fetch-news',
--         headers:='{"Content-Type": "application/json", "Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb
--     ) as request_id;
-- $$);
