-- Add username and email columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS email text;

-- Create an index for faster lookup during login
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username);

-- Note: You will need to populate the email and username fields for existing users 
-- manually or via a script, as this migration just creates the columns.
