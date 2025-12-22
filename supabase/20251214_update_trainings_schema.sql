-- Add missing columns to 'trainings' table
ALTER TABLE public.trainings
ADD COLUMN IF NOT EXISTS topic text,
ADD COLUMN IF NOT EXISTS media_url text,
ADD COLUMN IF NOT EXISTS audio_url text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Enable RLS
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;

-- Allow Public Access (Admin Panel Fix)
DROP POLICY IF EXISTS "Public insert trainings" ON trainings;
CREATE POLICY "Public insert trainings"
ON trainings FOR INSERT
TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "Public update trainings" ON trainings;
CREATE POLICY "Public update trainings"
ON trainings FOR UPDATE
TO public
USING (true);

DROP POLICY IF EXISTS "Public select trainings" ON trainings;
CREATE POLICY "Public select trainings"
ON trainings FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Public delete trainings" ON trainings;
CREATE POLICY "Public delete trainings"
ON trainings FOR DELETE
TO public
USING (true);
