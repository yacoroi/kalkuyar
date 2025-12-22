
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
            item->>'content',
            COALESCE((item->>'is_active')::boolean, true),
            NOW(),
            -- Use provided published_at or fallback to NOW()
            COALESCE((item->>'published_at')::timestamptz, NOW()),
            NOW()
        )
        ON CONFLICT (url) DO UPDATE
        SET 
            title = EXCLUDED.title,
            image_url = EXCLUDED.image_url,
            content = EXCLUDED.content,
            published_at = EXCLUDED.published_at, -- Update published_at if changed
            is_active = true,
            updated_at = NOW();
    END LOOP;
END;
$$;
