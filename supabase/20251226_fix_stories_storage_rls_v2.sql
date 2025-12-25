-- ==============================================
-- Stories Storage - Complete RLS Fix v2
-- Tüm eski policy'leri temizle ve yeniden oluştur
-- ==============================================

-- 1. Önce stories bucket'ına ait TÜM policy'leri sil
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND (policyname LIKE '%stories%' OR policyname LIKE 'stories_%' 
             OR policyname = 'Public Access' 
             OR policyname = 'Admin Upload'
             OR policyname = 'Admin Delete')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

-- 2. Bucket yoksa oluştur, varsa public yap
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('stories', 'stories', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Yeni policy'ler (benzersiz isimlerle)

-- SELECT: Herkes okuyabilir (public bucket)
CREATE POLICY "stories_bucket_public_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'stories');

-- INSERT: Sadece admin yükleyebilir
CREATE POLICY "stories_bucket_admin_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'stories' 
    AND (
        SELECT role FROM public.profiles WHERE id = auth.uid()
    ) = 'admin'
);

-- UPDATE: Sadece admin güncelleyebilir
CREATE POLICY "stories_bucket_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'stories' 
    AND (
        SELECT role FROM public.profiles WHERE id = auth.uid()
    ) = 'admin'
);

-- DELETE: Sadece admin silebilir
CREATE POLICY "stories_bucket_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'stories' 
    AND (
        SELECT role FROM public.profiles WHERE id = auth.uid()
    ) = 'admin'
);
