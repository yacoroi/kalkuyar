-- ==============================================
-- Stories Storage RLS Fix
-- Policy isimleri çakışma yaratıyordu, düzeltildi
-- ==============================================

-- Önce eski policy'leri kaldır (varsa)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

-- Yeni isimlerle oluştur
-- 1. Herkes stories bucket'ından okuyabilir
CREATE POLICY "stories_public_read"
ON storage.objects FOR SELECT
USING ( bucket_id = 'stories' );

-- 2. Admin yükleme
CREATE POLICY "stories_admin_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'stories' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- 3. Admin silme
CREATE POLICY "stories_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'stories' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);
