-- Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  username text NOT NULL UNIQUE,
  full_name text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Allow Admins to read the admins table (Strict)
DROP POLICY IF EXISTS "Admins can view admins" ON public.admins;
CREATE POLICY "Admins can view admins"
ON public.admins FOR SELECT
TO authenticated
USING (
  -- Only allow if the user is present in the admins table
  auth.uid() = id
);

-- Allow Admins to update their own data
DROP POLICY IF EXISTS "Admins can update themselves" ON public.admins;
CREATE POLICY "Admins can update themselves"
ON public.admins FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Indexes
CREATE INDEX IF NOT EXISTS admins_username_idx ON public.admins (username);

-- Grant access to public for finding username during login process if needed
-- Actually, with dummy email strategy, we might NOT need to lookup the admins table at all for login!
-- We can just construct email = username + '@saadet.admin' and try to login.
-- IF login succeeds, THEN we check if `auth.uid()` exists in `admins` table.
-- This is MUCH MORE SECURE because we don't expose the admins table to public at all.
-- So I will DROP the public lookup policy.

DROP POLICY IF EXISTS "Public can lookup admins" ON public.admins;
-- No public policy created. Access is restricted to Authenticated Admins only.
