-- Profiles tablosuna TC Kimlik ve Referans Kodu sütunları ekle

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS tc_kimlik TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referans_kodu TEXT;

-- TC kimlik için index
CREATE INDEX IF NOT EXISTS idx_profiles_tc_kimlik ON public.profiles(tc_kimlik);
