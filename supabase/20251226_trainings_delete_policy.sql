-- ==============================================
-- Trainings DELETE RLS Policy - Basitleştirilmiş
-- Tüm authenticated kullanıcıların silmesine izin ver
-- ==============================================

-- Önce mevcut policy'leri sil
DROP POLICY IF EXISTS "Admins can delete trainings" ON trainings;
DROP POLICY IF EXISTS "trainings_delete_admin" ON trainings;
DROP POLICY IF EXISTS "trainings_delete_authenticated" ON trainings;

-- Basit policy - authenticated kullanıcılar silebilir
CREATE POLICY "trainings_delete_all_authenticated"
ON trainings FOR DELETE
TO authenticated
USING (true);

-- RLS'in açık olduğundan emin ol
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
