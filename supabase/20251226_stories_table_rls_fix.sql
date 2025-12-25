-- ==============================================
-- Stories TABLE - RLS Fix
-- Authenticated kullanıcıların ekleme/silmesine izin ver
-- ==============================================

-- Önce eski policy'leri sil
DROP POLICY IF EXISTS "Everyone can view active stories" ON stories;
DROP POLICY IF EXISTS "Admins can insert stories" ON stories;
DROP POLICY IF EXISTS "Admins can delete stories" ON stories;

-- Yeni basit policy'ler

-- 1. Herkes aktif hikayeleri görebilir
CREATE POLICY "stories_select_active"
ON stories FOR SELECT
TO authenticated
USING (expires_at > NOW());

-- 2. Authenticated kullanıcılar ekleyebilir (admin kontrolü app seviyesinde)
CREATE POLICY "stories_insert_authenticated"
ON stories FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. Authenticated kullanıcılar silebilir
CREATE POLICY "stories_delete_authenticated"
ON stories FOR DELETE
TO authenticated
USING (true);
