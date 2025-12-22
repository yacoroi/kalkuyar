-- FORCE FIX STORAGE BUCKETS AND POLICIES
-- Run this script in the Supabase SQL Editor

-- 1. Create Buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('content_media', 'content_media', true),
  ('content_images', 'content_images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Media Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Media Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Images Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Images Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Give me access to everything" ON storage.objects;

-- 3. Create Permissive Policies
-- Allow PUBLIC read access to everything in these buckets
CREATE POLICY "Public Read Media"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'content_media' );

CREATE POLICY "Public Read Images"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'content_images' );

-- Allow AUTHENTICATED users (Admins) to Upload/Update/Delete
CREATE POLICY "Admin All Access Media"
ON storage.objects FOR ALL
TO authenticated
USING ( bucket_id = 'content_media' )
WITH CHECK ( bucket_id = 'content_media' );

CREATE POLICY "Admin All Access Images"
ON storage.objects FOR ALL
TO authenticated
USING ( bucket_id = 'content_images' )
WITH CHECK ( bucket_id = 'content_images' );

-- 4. Fix content_packs table if needed (Ensure columns exist check)
-- This part just verifies columns, won't error if they exist.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_packs' AND column_name = 'media_url') THEN
        ALTER TABLE content_packs ADD COLUMN media_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_packs' AND column_name = 'image_url') THEN
        ALTER TABLE content_packs ADD COLUMN image_url TEXT;
    END IF;
END $$;
