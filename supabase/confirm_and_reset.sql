-- EMAIL ONAYLAMA VE ŞİFRE DÜZELTME SCRİPTİ
-- Bazen "Email Confirm" yapılmadığı için giriş hatası alınır.

CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

DO $$
DECLARE
  target_email text := 'admin@kalkuyar.com';
  target_password text := 'admin123';
BEGIN
  -- 1. Kullanıcıyı Onayla (Email Confirmed yap)
  UPDATE auth.users
  SET 
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    encrypted_password = extensions.crypt(target_password, extensions.gen_salt('bf')),
    raw_app_meta_data = '{"provider":"email","providers":["email"]}',
    aud = 'authenticated',
    role = 'authenticated'
  WHERE email = target_email;

  RAISE NOTICE 'Kullanıcı (%s) tamamen onaylandı ve şifresi (%s) olarak ayarlandı.', target_email, target_password;
END $$;
