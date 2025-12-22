-- Force drop the function to ensure no stale signatures
DROP FUNCTION IF EXISTS public.archive_and_reset_season(text);

-- Re-create the function
CREATE OR REPLACE FUNCTION public.archive_and_reset_season(p_period_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert snapshot
    -- Explicitly cast rank() to integer to avoid potential type mismatch issues
    INSERT INTO public.leaderboard_history (
        period_name,
        user_id,
        full_name,
        avatar_url,
        district,
        neighborhood,
        points,
        rank
    )
    SELECT 
        p_period_name,
        id,
        full_name,
        avatar_url,
        district,
        neighborhood,
        points,
        rank() OVER (ORDER BY points DESC)::integer
    FROM public.profiles
    WHERE points > 0;

    -- Reset points
    UPDATE public.profiles
    SET points = 0;
END;
$$;

-- Grant permissions explicitly to all relevant roles
GRANT EXECUTE ON FUNCTION public.archive_and_reset_season(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.archive_and_reset_season(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.archive_and_reset_season(text) TO postgres;

-- Notify PostgREST to reload schema cache (essential for RPCs to appear in API)
NOTIFY pgrst, 'reload schema';
