-- MEVCUT EMAİL KULLANICISINI ADMİN YAPMA SCRİPTİ
-- Bu scripti, Supabase Dashboard'dan oluşturduğunuz herhangi bir kullanıcıyı 'admin' yetkisine yükseltmek için kullanın.

DO $$
DECLARE
  target_email text := 'admin@kalkuyar.com'; -- BURAYA ADMIN YAPMAK ISTEDIGINIZ MAIL ADRESINI YAZIN
  target_username text := 'Admin'; -- Panelde görünecek isim (Opsiyonel)
  
  user_id uuid;
BEGIN
  -- 1. Kullanıcıyı bul
  SELECT id INTO user_id FROM auth.users WHERE email = target_email;

  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Bu e-posta adresiyle bir kullanıcı bulunamadı: %. Lütfen önce Panelden kullanıcı oluşturun.', target_email;
  END IF;

  -- 2. Admins tablosuna ekle (Yetki Ver)
  INSERT INTO public.admins (id, username, full_name)
  VALUES (
    user_id,
    target_username,
    'Yönetici'
  )
  ON CONFLICT (id) DO NOTHING; -- Zaten ekliyse hata verme

  RAISE NOTICE 'Kullanıcıya Admin yetkisi verildi: %', target_email;
END $$;
