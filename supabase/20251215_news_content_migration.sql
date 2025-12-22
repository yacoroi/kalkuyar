
-- Add content column to news table
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS content TEXT;

-- Update the UPSERT function to include content
CREATE OR REPLACE FUNCTION upsert_news_items(items jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    item jsonb;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(items)
    LOOP
        INSERT INTO news (title, url, image_url, summary, content, is_active, created_at, published_at, updated_at)
        VALUES (
            item->>'title',
            item->>'url',
            item->>'image_url',
            item->>'summary',
            item->>'content', -- New field
            COALESCE((item->>'is_active')::boolean, true),
            NOW(),
            NOW(),
            NOW()
        )
        ON CONFLICT (url) DO UPDATE
        SET 
            title = EXCLUDED.title,
            image_url = EXCLUDED.image_url,
            content = EXCLUDED.content, -- Update content
            is_active = true,
            updated_at = NOW();
    END LOOP;
END;
$$;
