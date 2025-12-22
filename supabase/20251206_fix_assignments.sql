-- 1. TRIGGER GÜNCELLEME: Hem INSERT Hem UPDATE yakalasın
-- (Böylece kayıt sırasında profil güncellendiğinde de görev atanır)

CREATE OR REPLACE FUNCTION public.assign_active_tasks_to_new_user()
RETURNS TRIGGER AS $$
DECLARE
  pack RECORD;
BEGIN
  -- Aktif paketleri döngüye al
  FOR pack IN 
    SELECT id FROM public.content_packs 
    WHERE start_date <= CURRENT_DATE 
      AND end_date >= CURRENT_DATE
      AND is_active = true
  LOOP
    -- Eğer bu kullanıcıya bu görev zaten atanmamışsa ATA
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

-- Eski trigger'ı kaldır ve yenisini (INSERT OR UPDATE) ekle
DROP TRIGGER IF EXISTS on_profile_created_assign_tasks ON public.profiles;

CREATE TRIGGER on_profile_created_assign_tasks
AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.assign_active_tasks_to_new_user();


-- 2. GERİYE DÖNÜK DÜZELTME (Retroactive Fix)
-- Şu anki "Emre" gibi görevi alamamış kullanıcıları tara ve eksikleri tamamla.
DO $$
DECLARE
  target_user RECORD;
  active_pack RECORD;
BEGIN
  -- Tüm profilleri gez
  FOR target_user IN SELECT id FROM public.profiles LOOP
    
    -- Tüm aktif paketleri gez
    FOR active_pack IN 
        SELECT id FROM public.content_packs 
        WHERE start_date <= CURRENT_DATE 
          AND end_date >= CURRENT_DATE 
          AND is_active = true 
    LOOP
        -- Eksikse ekle
        IF NOT EXISTS (SELECT 1 FROM public.tasks WHERE user_id = target_user.id AND content_pack_id = active_pack.id) THEN
            INSERT INTO public.tasks (user_id, content_pack_id, status) 
            VALUES (target_user.id, active_pack.id, 'pending');
        END IF;
    END LOOP;

  END LOOP;
END $$;
