-- CRITICAL SECURITY FIX: LOCK DOWN DATABASE
-- Reverting "Public Write" permissions and enforcing "Authenticated" access.

-- 1. Content Packs (Haftalık Görev Paketleri)
-- Previously: TO public USING (true)
-- New: TO authenticated USING (true)

DROP POLICY IF EXISTS "Public insert content" ON content_packs;
DROP POLICY IF EXISTS "Public update content" ON content_packs;
DROP POLICY IF EXISTS "Public delete content" ON content_packs;
DROP POLICY IF EXISTS "Public select content" ON content_packs;

DROP POLICY IF EXISTS "Authenticated insert content" ON content_packs;
DROP POLICY IF EXISTS "Authenticated update content" ON content_packs;
DROP POLICY IF EXISTS "Authenticated delete content" ON content_packs;
DROP POLICY IF EXISTS "Authenticated select content" ON content_packs;

CREATE POLICY "Authenticated insert content"
ON content_packs FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

CREATE POLICY "Authenticated update content"
ON content_packs FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

CREATE POLICY "Authenticated delete content"
ON content_packs FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

CREATE POLICY "Authenticated select content"
ON content_packs FOR SELECT
TO authenticated
USING (true);


-- 2. Storage Buckets (Dosya Yükleme)
-- Enforcing Admin Check for Uploads

-- Media Bucket
DROP POLICY IF EXISTS "Public Insert Media" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert Media" ON storage.objects; -- Cleaning up old name if exists
DROP POLICY IF EXISTS "Authenticated Update Media" ON storage.objects; -- Cleaning up old name if exists

CREATE POLICY "Admin Insert Media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( 
  bucket_id = 'content_media' AND 
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()) 
);

CREATE POLICY "Admin Update Media"
ON storage.objects FOR UPDATE
TO authenticated
USING ( 
  bucket_id = 'content_media' AND 
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- Images Bucket
DROP POLICY IF EXISTS "Public Insert Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert Images" ON storage.objects; -- Cleaning up old name if exists
DROP POLICY IF EXISTS "Authenticated Update Images" ON storage.objects; -- Cleaning up old name if exists

CREATE POLICY "Admin Insert Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( 
  bucket_id = 'content_images' AND 
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

CREATE POLICY "Admin Update Images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( 
  bucket_id = 'content_images' AND 
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- Audio Bucket
DROP POLICY IF EXISTS "Public Insert Audio" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Audio" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert Audio" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert Audio" ON storage.objects; -- Cleaning up old name if exists
DROP POLICY IF EXISTS "Authenticated Update Audio" ON storage.objects; -- Cleaning up old name if exists

CREATE POLICY "Admin Insert Audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( 
  bucket_id = 'content_audio' AND 
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

CREATE POLICY "Admin Update Audio"
ON storage.objects FOR UPDATE
TO authenticated
USING ( 
  bucket_id = 'content_audio' AND 
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- Note: Read access (SELECT) is usually fine to be Public for these buckets if they are used in public facing apps, 
-- but strictly speaking, if we want total lockdown, we could make SELECT authenticated too.
-- For now, we only lock down WRITE/UPDATE/DELETE.
