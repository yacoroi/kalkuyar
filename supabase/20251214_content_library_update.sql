-- 1. Add audio_url to content_packs table
ALTER TABLE public.content_packs
ADD COLUMN IF NOT EXISTS audio_url text;

-- 2. Create Storage Buckets (if they don't exist)
-- Note: SQL to create buckets is specific to Supabase Extensions, usually done via UI or client.
-- However, we can insert into storage.buckets if using local/self-hosted or if supported.
-- For safety, we will assume buckets might need to be created via dashboard, but we can try inserting.

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('content_media', 'content_media', true),
  ('content_images', 'content_images', true),
  ('content_audio', 'content_audio', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies (Allow Public Read, Authenticated Insert/Update for Admin)

-- Policy for content_media (PDF/Video)
CREATE POLICY "Public Access Media"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'content_media' );

CREATE POLICY "Authenticated Upload Media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'content_media' );

CREATE POLICY "Authenticated Update Media"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'content_media' );

-- Policy for content_images (Cover Images)
CREATE POLICY "Public Access Images"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'content_images' );

CREATE POLICY "Authenticated Upload Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'content_images' );

CREATE POLICY "Authenticated Update Images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'content_images' );

-- Policy for content_audio (Audio Files)
CREATE POLICY "Public Access Audio"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'content_audio' );

CREATE POLICY "Authenticated Upload Audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'content_audio' );

CREATE POLICY "Authenticated Update Audio"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'content_audio' );
