-- Üye kayıtları tablosu
-- Bir kullanıcının kaydettiği yeni üyeleri takip eder

CREATE TABLE IF NOT EXISTS public.member_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User lookup için index
CREATE INDEX idx_member_registrations_user_id ON public.member_registrations(user_id);
CREATE INDEX idx_member_registrations_created_at ON public.member_registrations(created_at);

-- RLS
ALTER TABLE public.member_registrations ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi kayıtlarını görebilir
CREATE POLICY "Users can view own registrations"
  ON public.member_registrations FOR SELECT
  USING (auth.uid() = user_id);

-- Kullanıcılar yeni kayıt ekleyebilir
CREATE POLICY "Users can insert own registrations"
  ON public.member_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);
