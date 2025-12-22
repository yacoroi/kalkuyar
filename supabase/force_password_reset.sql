-- ŞİFRE SIFIRLAMA SCRİPTİ (MANUEL)
-- Dashboard çalışmadığında bu scriptle şifreyi sql üzerinden değiştirebilirsiniz.

-- 1. Eklentiyi garantiye al
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

DO $$
DECLARE
  target_email text := 'admin@kalkuyar.com'; -- ŞİFRESİ DEĞİŞECEK MAİL
  new_password text := 'admin123';           -- YENİ ŞİFRE
  
  user_id uuid;
BEGIN
  -- 1. Kullanıcıyı bul
  SELECT id INTO user_id FROM auth.users WHERE email = target_email;

  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Kullanıcı bulunamadı: %', target_email;
  END IF;

  -- 2. Şifreyi güncelle
  UPDATE auth.users
  SET encrypted_password = extensions.crypt(new_password, extensions.gen_salt('bf'))
  WHERE id = user_id;

  -- 3. Admins tablosunda olduğundan emin ol
  INSERT INTO public.admins (id, username, full_name)
  VALUES (user_id, 'Admin', 'Kalkuyar Admin')
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Şifre başarıyla güncellendi!';
  RAISE NOTICE 'Email: %', target_email;
  RAISE NOTICE 'Yeni Şifre: %', new_password;
END $$;
