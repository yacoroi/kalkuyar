-- FIX RLS Violations for Admin Content Management
-- Since the Admin Panel user is currently unauthenticated (anon), we must allow public access.

-- 1. Policies for 'content_packs' TABLE
ALTER TABLE content_packs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert content" ON content_packs;
CREATE POLICY "Public insert content"
ON content_packs FOR INSERT
TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "Public update content" ON content_packs;
CREATE POLICY "Public update content"
ON content_packs FOR UPDATE
TO public
USING (true);

DROP POLICY IF EXISTS "Public delete content" ON content_packs;
CREATE POLICY "Public delete content"
ON content_packs FOR DELETE
TO public
USING (true);

DROP POLICY IF EXISTS "Public select content" ON content_packs;
CREATE POLICY "Public select content"
ON content_packs FOR SELECT
TO public
USING (true);

-- 2. Policies for STORAGE Buckets (Allowing Anon Uploads)
-- We need to drop the 'Authenticated' strict policies or add Public ones.
-- Adding Public Insert/Update policies for the specific buckets.

-- Media Bucket
CREATE POLICY "Public Insert Media"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'content_media' );

CREATE POLICY "Public Update Media"
ON storage.objects FOR UPDATE
TO public
USING ( bucket_id = 'content_media' );

-- Images Bucket
CREATE POLICY "Public Insert Images"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'content_images' );

CREATE POLICY "Public Update Images"
ON storage.objects FOR UPDATE
TO public
USING ( bucket_id = 'content_images' );

-- Audio Bucket
CREATE POLICY "Public Insert Audio"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'content_audio' );

CREATE POLICY "Public Update Audio"
ON storage.objects FOR UPDATE
TO public
USING ( bucket_id = 'content_audio' );
