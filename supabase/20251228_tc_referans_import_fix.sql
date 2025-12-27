-- TC Referans tablosuna INSERT izni ver (sadece bulk import için)
-- Bu sorguyu çalıştırdıktan sonra import yapabilirsiniz

-- Geçici olarak RLS'yi devre dışı bırak
ALTER TABLE public.tc_referans DISABLE ROW LEVEL SECURITY;

-- (Alternatif: Import sonrası RLS'yi tekrar etkinleştir)
-- ALTER TABLE public.tc_referans ENABLE ROW LEVEL SECURITY;
