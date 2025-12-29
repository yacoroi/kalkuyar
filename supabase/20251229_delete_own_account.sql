-- Create a function to allow users to delete their own account
create or replace function delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Delete the user from auth.users table
  -- This will cascade to public.profiles and other related tables because of foreign key constraints
  delete from auth.users where id = auth.uid();
end;
$$;
