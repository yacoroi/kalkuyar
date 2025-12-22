-- SON VE KESİN ADMİN OLUŞTURMA SCRİPTİ (KULLANICI ADI İLE)
-- Kullanıcı Adı: admin
-- Şifre: admin
-- (Email Providers kapalı olsa bile SQL ile oluşturulduğu için çalışır)

CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

DO $$
DECLARE
  target_username text := 'admin';
  target_password text := 'admin';
  
  -- Arka planda kullanılacak dummy email
  target_email text := target_username || '@saadet.admin';
  new_user_id uuid;
BEGIN
  -- 1. Temizlik (Varsa süpür)
  DELETE FROM public.admins WHERE username = target_username;
  DELETE FROM auth.users WHERE email = target_email;

  -- 2. Auth kullanıcısını oluştur
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
    extensions.crypt(target_password, extensions.gen_salt('bf')),
    now(), -- Doğrulanmış
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

  -- 3. Admin tablosuna ekle
  INSERT INTO public.admins (id, username, full_name)
  VALUES (
    new_user_id,
    target_username,
    'Sistem Yöneticisi'
  );

  RAISE NOTICE 'Admin kullanıcısı oluşturuldu.';
  RAISE NOTICE 'Kullanıcı Adı: %', target_username;
  RAISE NOTICE 'Şifre: %', target_password;
END $$;
