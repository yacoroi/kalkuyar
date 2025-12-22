-- DÜZELTME: Admins tablosundan email sütununu kaldırma
-- "Emailsiz Admin" yapısına geçtiğimiz için bu sütuna artık ihtiyaç yok.
-- Ve varlığı "Not Null" hatasına sebep oluyor.

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'admins' AND column_name = 'email') THEN
        ALTER TABLE public.admins DROP COLUMN email;
    END IF;
END $$;
