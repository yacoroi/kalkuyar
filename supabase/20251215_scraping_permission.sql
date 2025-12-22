-- Create a function to upsert news items that bypasses RLS
-- This is necessary because the scraping logic runs with the Anon Key locally and cannot bypass RLS directly.
-- The function uses SECURITY DEFINER to run with the privileges of the creator (postgres/admin).

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
        INSERT INTO news (title, url, image_url, summary, is_active, created_at, published_at)
        VALUES (
            item->>'title',
            item->>'url',
            item->>'image_url',
            item->>'summary',
            COALESCE((item->>'is_active')::boolean, true),
            NOW(),
            NOW()
        )
        ON CONFLICT (url) DO UPDATE
        SET 
            title = EXCLUDED.title,
            image_url = EXCLUDED.image_url,
            updated_at = NOW();
    END LOOP;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION upsert_news_itemsTo anon, authenticated, service_role;
