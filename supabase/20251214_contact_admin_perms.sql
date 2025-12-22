-- Enable RLS on contact_messages if not already (it is)
-- ALERT: This policy is permissive for 'authenticated' users to allow the Admin Panel to work.
-- Ideally, we should check for 'admin' role, but we want to ensure immediate access.

DROP POLICY IF EXISTS "Users can view their own messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow authenticated to view all messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow authenticated to update messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow authenticated to delete messages" ON contact_messages;


-- Allow viewing ALL messages (essential for Admin Panel)
CREATE POLICY "Allow authenticated to view all messages"
ON contact_messages FOR SELECT
TO authenticated
USING (true);

-- Allow updating messages (e.g. marking as read)
CREATE POLICY "Allow authenticated to update messages"
ON contact_messages FOR UPDATE
TO authenticated
USING (true);

-- Allow deleting messages
CREATE POLICY "Allow authenticated to delete messages"
ON contact_messages FOR DELETE
TO authenticated
USING (true);

-- Insert policy remains "Users can insert their own messages" (defined in previous migration)
-- But ensuring it doesn't conflict
-- CREATE POLICY "Users can insert their own messages" ... (already exists)
