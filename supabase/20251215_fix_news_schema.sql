-- Add missing updated_at column to news table
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Re-run the function definition just to be safe (though not strictly required if only column was missing)
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
        INSERT INTO news (title, url, image_url, summary, is_active, created_at, published_at, updated_at)
        VALUES (
            item->>'title',
            item->>'url',
            item->>'image_url',
            item->>'summary',
            COALESCE((item->>'is_active')::boolean, true),
            NOW(),
            NOW(),
            NOW()
        )
        ON CONFLICT (url) DO UPDATE
        SET 
            title = EXCLUDED.title,
            image_url = EXCLUDED.image_url,
            is_active = true,
            updated_at = NOW();
    END LOOP;
END;
$$;
