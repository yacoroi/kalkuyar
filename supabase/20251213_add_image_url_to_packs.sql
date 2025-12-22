-- Add image_url column to content_packs for cover images
ALTER TABLE public.content_packs 
ADD COLUMN IF NOT EXISTS image_url text;

-- (Optional) Copy existing media_url to image_url if it looks like an image, 
-- but simpler to just leave it empty and let admin update it.
