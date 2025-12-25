-- ==============================================
-- DEBUG: Storage RLS sorunu analizi
-- ==============================================

-- 1. Mevcut storage policies'leri listele
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- 2. stories bucket var mı kontrol et
SELECT * FROM storage.buckets WHERE id = 'stories';

-- 3. Admin kullanıcıları listele (rol kontrolü için)
SELECT id, full_name, role FROM public.profiles WHERE role = 'admin' LIMIT 5;

-- 4. Şu an giriş yapmış kullanıcının bilgisi (admin panelinden giriş yapıldığında)
-- Bu sorguyu admin panelinden Supabase'e bağlıyken çalıştırın
SELECT auth.uid() as current_user_id;

-- 5. Giriş yapmış kullanıcının rolü
SELECT 
    p.id,
    p.full_name,
    p.role,
    CASE WHEN p.role = 'admin' THEN 'ADMIN - YÜKLEYEBİLMELİ' ELSE 'ADMIN DEĞİL - YÜKLEYEMEZ' END as status
FROM public.profiles p 
WHERE p.id = auth.uid();
