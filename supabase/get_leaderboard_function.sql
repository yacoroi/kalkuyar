-- Drop the function first to allow return type change
DROP FUNCTION IF EXISTS public.get_leaderboard(text,text,text,text,integer);

CREATE OR REPLACE FUNCTION public.get_leaderboard(
    p_scope text,
    p_city text,
    p_district text DEFAULT NULL,
    p_neighborhood text DEFAULT NULL,
    p_limit integer DEFAULT 50
)
RETURNS TABLE (
    rank bigint,
    user_id uuid,
    full_name text,
    avatar_url text,
    points integer,
    scope_text text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH ranked_users AS (
        SELECT
            p.id as r_user_id,
            p.full_name as r_full_name,
            p.avatar_url as r_avatar_url,
            p.points as r_points,
            RANK() OVER (ORDER BY p.points DESC) as r_rank
        FROM
            public.profiles p
        WHERE
            p.role IN ('member', 'admin', 'district_head') -- Include all roles
            AND p.city = p_city -- Always filter by city at least
            AND (
                CASE
                    WHEN p_scope = 'district' THEN p.district = p_district
                    WHEN p_scope = 'neighborhood' THEN p.district = p_district AND p.neighborhood = p_neighborhood
                    ELSE TRUE -- For 'city' scope, no extra filter
                END
            )
    )
    SELECT
        r_rank::bigint,
        r_user_id,
        r_full_name,
        r_avatar_url,
        r_points,
        p_scope
    FROM
        ranked_users
    ORDER BY
        r_rank ASC
    LIMIT
        p_limit;
END;
$$;
