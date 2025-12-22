-- DIAGNOSTIC SCRIPT
-- Admin kullanıcısının durumunu kontrol eder.

SELECT 'AUTH USER' as type, id, email, role, last_sign_in_at, created_at 
FROM auth.users 
WHERE email = 'admin@saadet.admin';

SELECT 'PUBLIC ADMIN' as type, id, username, full_name, created_at 
FROM public.admins 
WHERE username = 'admin';
