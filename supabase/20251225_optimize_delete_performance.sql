-- ==============================================
-- Optimize Delete Performance with is_admin()
-- ==============================================

-- 1. Create a STABLE is_admin function to cache result within transaction
-- This avoids repeated lookups to the profiles table for every row check
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Optimize Policies to use is_admin()
-- --------------------------------------------

-- A. Contact Messages
DROP POLICY IF EXISTS "Admins can delete contact messages" ON contact_messages;
CREATE POLICY "Admins can delete contact messages"
ON contact_messages FOR DELETE
TO authenticated
USING (is_admin());

-- B. Training Survey Responses
DROP POLICY IF EXISTS "Admins can delete survey responses" ON training_survey_responses;
CREATE POLICY "Admins can delete survey responses"
ON training_survey_responses FOR DELETE
TO authenticated
USING (is_admin());

-- C. Trainings
DROP POLICY IF EXISTS "Admins can delete trainings" ON trainings;
CREATE POLICY "Admins can delete trainings"
ON trainings FOR DELETE
TO authenticated
USING (is_admin());

-- 3. Ensure Indexes on Foreign Keys (Double Check)
-- --------------------------------------------
-- If these indexes were missing or the previous migration failed, these will fix it.
-- Cascade deletes will be very slow without indexes on the "many" side.

CREATE INDEX IF NOT EXISTS idx_training_reads_training_id ON training_reads(training_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_training_id ON training_survey_responses(training_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id ON contact_messages(user_id);
