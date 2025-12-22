-- EMAIL LOGIN DEBUG SCRIPT
-- Bu sorgu, kullanıcının veritabanında var olup olmadığını kontrol eder.

SELECT 'AUTH USER' as type, id, email, role, last_sign_in_at, created_at 
FROM auth.users 
WHERE email = 'admin@kalkuyar.com';

SELECT 'PUBLIC ADMIN' as type, id, username, full_name 
FROM public.admins 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@kalkuyar.com');
