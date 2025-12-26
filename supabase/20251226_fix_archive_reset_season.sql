-- ==============================================
-- archive_and_reset_season fonksiyonu düzeltmesi
-- İki parametre destekler: p_period_name ve p_season_target
-- ==============================================

-- Önce tüm eski fonksiyonları sil
DROP FUNCTION IF EXISTS public.archive_and_reset_season(text);
DROP FUNCTION IF EXISTS public.archive_and_reset_season(text, int);

-- İki parametreli düzeltilmiş fonksiyonu oluştur
CREATE OR REPLACE FUNCTION public.archive_and_reset_season(
    p_period_name text,
    p_season_target int DEFAULT 15
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert snapshot
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

    -- Reset points - WHERE clause eklendi
    UPDATE public.profiles
    SET points = 0
    WHERE id IS NOT NULL;
    
    -- Season contacts'ı sıfırla ve yeni hedefi ayarla
    UPDATE public.profiles
    SET 
        season_contacts = 0,
        season_target = p_season_target
    WHERE id IS NOT NULL;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.archive_and_reset_season(text, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.archive_and_reset_season(text, int) TO service_role;
GRANT EXECUTE ON FUNCTION public.archive_and_reset_season(text, int) TO postgres;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
