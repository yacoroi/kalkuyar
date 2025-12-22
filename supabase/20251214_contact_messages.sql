-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Users can insert their own messages
CREATE POLICY "Users can insert their own messages"
ON contact_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can view all messages (assuming admin policies exist, otherwise generic read)
-- For now, allow authenticated users to view their own messages
CREATE POLICY "Users can view their own messages"
ON contact_messages FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins need full access (usually handled by service role or specific admin role check)
-- Adding a policy for potential admin role check if needed later, 
-- but Supabase Admin client bypasses RLS anyway.
