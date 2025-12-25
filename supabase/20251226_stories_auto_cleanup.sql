-- ==============================================
-- Süresi Dolan Hikayeleri Otomatik Silme
-- pg_cron extension ile saatlik çalışır
-- ==============================================

-- 1. pg_cron extension'ı etkinleştir (Supabase'de zaten aktif olabilir)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Temizlik fonksiyonu oluştur
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS void AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Süresi dolmuş hikayeleri sil
    DELETE FROM stories 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log (opsiyonel)
    IF deleted_count > 0 THEN
        RAISE NOTICE 'Deleted % expired stories', deleted_count;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Cron job oluştur (her saat başı çalışır)
-- NOT: Bu komutu Supabase SQL Editor'da çalıştırın
-- Supabase'de pg_cron aktif değilse, Dashboard > Database > Extensions'dan etkinleştirin

-- SELECT cron.schedule(
--     'cleanup-expired-stories',  -- job adı
--     '0 * * * *',                -- her saat başı
--     'SELECT cleanup_expired_stories()'
-- );

-- ALTERNATİF: Manuel temizlik yapmak isterseniz bu sorguyu çalıştırın:
-- SELECT cleanup_expired_stories();

-- 4. Mevcut süresi dolmuş hikayeleri hemen temizle
SELECT cleanup_expired_stories();
