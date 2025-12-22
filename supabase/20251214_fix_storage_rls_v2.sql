-- FORCE FIX for Storage RLS Violations
-- Run this in Supabase SQL Editor

-- 1. Ensure Buckets Exist and are Public
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('content_media', 'content_media', true),
  ('content_images', 'content_images', true),
  ('content_audio', 'content_audio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop ANY existing policies related to these buckets to avoid conflicts
-- Media
DROP POLICY IF EXISTS "Public Access Media" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Media" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Media" ON storage.objects;

-- Images
DROP POLICY IF EXISTS "Public Access Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Images" ON storage.objects;

-- Audio
DROP POLICY IF EXISTS "Public Access Audio" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Audio" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Audio" ON storage.objects;

-- 3. Create BLANKET Public Policies for each bucket
-- This allows Select, Insert, Update, Delete for EVERYONE (anon + authenticated)

-- Content Media (PDFs/Videos)
CREATE POLICY "Content Media Policy"
ON storage.objects FOR ALL
TO public
USING ( bucket_id = 'content_media' )
WITH CHECK ( bucket_id = 'content_media' );

-- Content Images (Cover Photos)
CREATE POLICY "Content Images Policy"
ON storage.objects FOR ALL
TO public
USING ( bucket_id = 'content_images' )
WITH CHECK ( bucket_id = 'content_images' );

-- Content Audio (MP3s)
CREATE POLICY "Content Audio Policy"
ON storage.objects FOR ALL
TO public
USING ( bucket_id = 'content_audio' )
WITH CHECK ( bucket_id = 'content_audio' );
