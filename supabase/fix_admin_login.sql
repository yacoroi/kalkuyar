-- ADMIN LOGİN DÜZELTME SCRİPTİ
-- Bu script mevcut admin kullanıcısını silip TEMİZ bir şekilde yeniden oluşturur.

-- 1. Eklenti (Genelde 'extensions' şemasındadır)
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

DO $$
DECLARE
  target_username text := 'admin';
  target_email text := 'admin@saadet.admin';
  target_password text := 'admin'; -- ŞİFRE BURADA 'admin' OLARAK AYARLANDI
  
  new_user_id uuid;
BEGIN
  -- 2. Temizlik: Varsa önce eski kullanıcıyı silelim (Hatalı state kalmasın)
  DELETE FROM public.admins WHERE username = target_username;
  DELETE FROM auth.users WHERE email = target_email;

  -- 3. Auth kullanıcısını oluştur
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    target_email,
    extensions.crypt(target_password, extensions.gen_salt('bf')), -- Şifreleme (extensions şeması)
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- 4. Admin tablosuna ekle
  INSERT INTO public.admins (id, username, full_name)
  VALUES (
    new_user_id,
    target_username,
    'Sistem Yöneticisi'
  );

  RAISE NOTICE 'Admin kullanıcısı SIFIRDAN oluşturuldu.';
  RAISE NOTICE 'Kullanıcı Adı: admin';
  RAISE NOTICE 'Şifre: admin';
END $$;
