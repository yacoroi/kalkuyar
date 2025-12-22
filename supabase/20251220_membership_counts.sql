-- Add membership_counts column to reports table for storing multiple membership types with counts
-- Run this in Supabase SQL Editor

-- Add JSONB column for storing membership counts
-- Format: {"üye_oldu": 5, "gönüllü": 3, "kararsız": 2, "üyelik_istemiyor": 1}
ALTER TABLE reports ADD COLUMN IF NOT EXISTS membership_counts JSONB DEFAULT '{}';

-- Create index for faster queries on membership_counts
CREATE INDEX IF NOT EXISTS idx_reports_membership_counts ON reports USING GIN (membership_counts);

-- Example query to get total counts by membership type:
-- SELECT 
--     SUM((membership_counts->>'üye_oldu')::int) as total_members,
--     SUM((membership_counts->>'gönüllü')::int) as total_volunteers,
--     SUM((membership_counts->>'kararsız')::int) as total_undecided,
--     SUM((membership_counts->>'üyelik_istemiyor')::int) as total_refused
-- FROM reports
-- WHERE membership_counts IS NOT NULL;

-- Update existing reports to have empty membership_counts if null
UPDATE reports SET membership_counts = '{}' WHERE membership_counts IS NULL;
