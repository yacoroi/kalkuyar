-- OTOMATİK GÖREV ATAMA TETİĞİ (TRIGGER)

-- Bu fonksiyon, 'profiles' tablosuna yeni bir kayıt eklendiğinde (yani yeni üye kaydolduğunda) çalışır.
-- O anki tarih aralığında aktif olan (start_date <= bugün <= end_date) görev paketlerini bulur.
-- Ve bu yeni kullanıcıya otomatik olarak atar.

CREATE OR REPLACE FUNCTION public.assign_active_tasks_to_new_user()
RETURNS TRIGGER AS $$
DECLARE
  pack RECORD;
BEGIN
  -- Aktif paketleri bul (Tarih aralığı uygun olanlar)
  FOR pack IN 
    SELECT id FROM public.content_packs 
    WHERE start_date <= CURRENT_DATE 
      AND end_date >= CURRENT_DATE
      AND is_active = true
  LOOP
    -- Görev tablosuna ekle (Eğer zaten yoksa)
    -- (NOT EXISTS kontrolü ile çift kaydı engelliyoruz)
    IF NOT EXISTS (
        SELECT 1 FROM public.tasks 
        WHERE user_id = NEW.id AND content_pack_id = pack.id
    ) THEN
        INSERT INTO public.tasks (user_id, content_pack_id, status)
        VALUES (NEW.id, pack.id, 'pending');
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- SECURITY DEFINER: Bu fonksiyon yönetici yetkileriyle çalışır, RLS engeline takılmaz.

-- Tetiği (Trigger) Oluşturma
DROP TRIGGER IF EXISTS on_profile_created_assign_tasks ON public.profiles;

CREATE TRIGGER on_profile_created_assign_tasks
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.assign_active_tasks_to_new_user();
