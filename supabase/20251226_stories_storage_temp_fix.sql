-- ==============================================
-- Stories Storage - Geçici Çözüm
-- Authenticated kullanıcıların yüklemesine izin ver
-- (Admin kontrolü uygulama seviyesinde yapılacak)
-- ==============================================

-- Önce tüm stories policy'lerini sil
DROP POLICY IF EXISTS "stories_bucket_public_select" ON storage.objects;
DROP POLICY IF EXISTS "stories_bucket_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "stories_bucket_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "stories_bucket_admin_delete" ON storage.objects;
DROP POLICY IF EXISTS "stories_public_read" ON storage.objects;
DROP POLICY IF EXISTS "stories_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "stories_admin_delete" ON storage.objects;

-- Bucket'ı public yap
UPDATE storage.buckets SET public = true WHERE id = 'stories';

-- Basit policy'ler oluştur

-- 1. Herkes okuyabilir
CREATE POLICY "stories_select_all"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'stories');

-- 2. Authenticated kullanıcılar yükleyebilir (Admin kontrolü app seviyesinde)
CREATE POLICY "stories_insert_authenticated"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'stories');

-- 3. Authenticated kullanıcılar silebilir
CREATE POLICY "stories_delete_authenticated"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'stories');
