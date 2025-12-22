-- Allow Public (Anon) and Authenticated Access to Contact Messages
-- This is a TEMPORARY fix for development to treat everyone as admin

-- 1. Reset Policies
DROP POLICY IF EXISTS "Admins can view all contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can update contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can delete contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON contact_messages;

-- 2. Create Permissive Policies for SELECT (View)
-- Allow anyone (anon + authenticated) to see all messages
CREATE POLICY "Public view all messages"
ON contact_messages FOR SELECT
TO public
USING (true);

-- 3. Create Permissive Policies for UPDATE/DELETE
-- Allow anyone to update/delete (dangerous, but requested for "everyone is admin")
CREATE POLICY "Public update messages"
ON contact_messages FOR UPDATE
TO public
USING (true);

CREATE POLICY "Public delete messages"
ON contact_messages FOR DELETE
TO public
USING (true);

-- 4. INSERT Policy (Already exists for authenticated, let's allow anon too if needed, but mobile app sends as auth)
-- Keeping existing insert policy or ensuring valid user check isn't broken
-- Mobile app users are authenticated, so they use the 'authenticated' role.
-- Admin panel users (anon) might need to reply? (Not implemented yet)
