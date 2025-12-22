-- DİKKAT: BU KOD TÜM SAHA RAPORLARINI SİLER!
-- VE TÜM GÖREVLERİ "TAMAMLANMADI" (PENDING) DURUMUNA GETİRİR.

-- 1. Tüm Saha Raporlarını Sil
TRUNCATE TABLE public.reports RESTART IDENTITY CASCADE;

-- 2. Tüm Görevleri Sıfırla
UPDATE public.tasks
SET 
  status = 'pending',
  completed_at = NULL;
