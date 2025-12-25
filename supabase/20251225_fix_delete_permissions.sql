-- ==============================================
-- Fix Delete Permissions for Admin Panel
-- ==============================================

-- 1. Fix training_survey_responses permissions
-- --------------------------------------------

-- Grant DELETE permission to authenticated users (RLS will control who can actually delete)
GRANT DELETE ON training_survey_responses TO authenticated;

-- Add RLS policy for deleting survey responses (Admins only)
DROP POLICY IF EXISTS "Admins can delete survey responses" ON training_survey_responses;
CREATE POLICY "Admins can delete survey responses"
ON training_survey_responses FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);


-- 2. Fix contact_messages permissions
-- --------------------------------------------

-- Grant DELETE permission to authenticated users
GRANT DELETE ON contact_messages TO authenticated;

-- Safely recreate delete policy for messages
DROP POLICY IF EXISTS "Allow authenticated to delete messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can delete contact messages" ON contact_messages;

CREATE POLICY "Admins can delete contact messages"
ON contact_messages FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- 3. Fix trainings permissions (Content Library)
-- --------------------------------------------

-- Grant DELETE permission to authenticated users
GRANT DELETE ON trainings TO authenticated;

-- Safely recreate delete policy for trainings
-- (Checking existing policies to avoid conflicts, but enforcing admin check is safer)
DROP POLICY IF EXISTS "Public delete trainings" ON trainings;
DROP POLICY IF EXISTS "Admins can delete trainings" ON trainings;

CREATE POLICY "Admins can delete trainings"
ON trainings FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);
