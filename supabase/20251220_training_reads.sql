-- Create training_reads table for tracking which trainings users have read
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS training_reads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    training_id INTEGER NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, training_id)
);

-- Enable RLS
ALTER TABLE training_reads ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own reads
CREATE POLICY "Users can view their own training reads"
ON training_reads FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own reads
CREATE POLICY "Users can mark trainings as read"
ON training_reads FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own reads (if they want to mark as unread)
CREATE POLICY "Users can unmark their training reads"
ON training_reads FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_training_reads_user ON training_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_training_reads_training ON training_reads(training_id);
