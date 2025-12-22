-- Admin Access Policies for contact_messages

-- Admins can view ALL messages
CREATE POLICY "Admins can view all contact messages"
ON contact_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admins can update messages (e.g. mark as read)
CREATE POLICY "Admins can update contact messages"
ON contact_messages FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admins can delete messages
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
