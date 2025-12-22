-- Add topic column for self-reported feedback categories
alter table public.reports 
add column topic text;

-- Make task_id nullable because self-reports are not linked to a specific task
alter table public.reports 
alter column task_id drop not null;
