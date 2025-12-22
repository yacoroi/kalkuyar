-- 1. YENİ ÖZELLİK: Tarih Kolonlarını Ekleme
-- (Admin panelinde eklediğimiz Başlangıç ve Bitiş tarihleri için)
ALTER TABLE public.content_packs 
ADD COLUMN IF NOT EXISTS start_date date,
ADD COLUMN IF NOT EXISTS end_date date;

-- 2. HATA DÜZELTME: Silme İşlemi İçin Cascade Ayarları
-- "violated foreign key constraint" hatasını çözer.
-- Bir paket silindiğinde görevler, görev silindiğinde raporlar otomatik silinir.

-- Önce mevcut kısıtlamaları kaldırıyoruz (İsimler varsayılan Supabase isimleridir, farklıysa kontrol ediniz)
ALTER TABLE public.tasks 
DROP CONSTRAINT IF EXISTS tasks_content_pack_id_fkey;

ALTER TABLE public.reports 
DROP CONSTRAINT IF EXISTS reports_task_id_fkey;

-- Kısıtlamaları CASCADE özelliği ile yeniden ekliyoruz
ALTER TABLE public.tasks
ADD CONSTRAINT tasks_content_pack_id_fkey
FOREIGN KEY (content_pack_id)
REFERENCES public.content_packs (id)
ON DELETE CASCADE;

ALTER TABLE public.reports
ADD CONSTRAINT reports_task_id_fkey
FOREIGN KEY (task_id)
REFERENCES public.tasks (id)
ON DELETE CASCADE;
