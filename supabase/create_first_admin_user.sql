-- OTOMATIK ADMIN OLUSTURMA SCRIPTI (TEK TIKLA KURULUM)
-- Bu script hem Auth kullanıcısını hem de Admin tablosunu otomatik oluşturur.
-- Dashboard'a gitmenize gerek yoktur.

-- Gerekli eklentiyi aç (Şifreleme için)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  -- BURAYI DUZENLEYIN:
  target_username text := 'admin';
  target_password text := 'admin'; -- Varsayılan şifre
  
  -- Otomatik oluşturulacaklar:
  target_email text := target_username || '@saadet.admin';
  new_user_id uuid;
BEGIN

  -- 1. Kullanıcı daha önce var mı kontrol et
  SELECT id INTO new_user_id FROM auth.users WHERE email = target_email;

  IF new_user_id IS NOT NULL THEN
    RAISE NOTICE 'Bu kullanıcı zaten var. ID: %', new_user_id;
  ELSE
    -- 2. Yoksa auth.users tablosuna manuel ekle
    -- Not: crypt() fonksiyonu şifreyi güvenli bir şekilde hashler.
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
      '00000000-0000-0000-0000-000000000000', -- Genellikle default instance uuid
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      target_email,
      crypt(target_password, gen_salt('bf')), -- Şifreleme
      now(), -- Email onaylanmış sayılır
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
    
    RAISE NOTICE 'Yeni Auth kullanıcısı oluşturuldu: % (Şifre: %)', target_email, target_password;
  END IF;

  -- 3. Admins tablosuna bağla
  INSERT INTO public.admins (id, username, full_name)
  VALUES (
    new_user_id,
    target_username,
    'Sistem Yöneticisi'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    username = EXCLUDED.username,
    full_name = 'Sistem Yöneticisi';

  RAISE NOTICE 'Admin yetkileri verildi. Giriş yapabilirsiniz.';
END $$;
