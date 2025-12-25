-- ==============================================
-- Stories (Hikayeler) Özelliği Kurulumu
-- ==============================================

-- 1. STORIES Tablosu
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT CHECK (media_type IN ('image', 'video')) NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Indexler
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);

-- RLS: Stories
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Politikalar:
-- 1. Görünürlük: Herkes (authenticated) süresi dolmamış hikayeleri görebilir.
CREATE POLICY "Everyone can view active stories"
ON stories FOR SELECT
TO authenticated
USING (expires_at > NOW());

-- 2. Ekleme: Sadece Adminler
CREATE POLICY "Admins can insert stories"
ON stories FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- 3. Silme: Sadece Adminler (Kendi hikayesi olsun olmasın)
CREATE POLICY "Admins can delete stories"
ON stories FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);


-- 2. STORY_VIEWS Tablosu
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS story_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id, viewer_id) -- Bir kullanıcı bir hikayeyi bir kez gördü sayılır
);

-- Indexler
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_viewer_id ON story_views(viewer_id);

-- RLS: Story Views
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

-- Politikalar:
-- 1. Ekleme: Kullanıcılar kendi izlemelerini ekler
CREATE POLICY "Users can insert their own views"
ON story_views FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = viewer_id);

-- 2. Görme: Kullanıcılar kendi izlemelerini görebilir (UI'da gri halka için)
CREATE POLICY "Users can view their own views"
ON story_views FOR SELECT
TO authenticated
USING (auth.uid() = viewer_id);

-- 3. Görme (Admin): Adminler hikayelerini kimin izlediğini görebilir
CREATE POLICY "Admins can view who viewed stories"
ON story_views FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- 3. STORAGE BUCKET (stories)
-- Not: Bu adım genellikle Dashboard üzerinden yapılır ama SQL ile de bucket insert edilebilir.
-- Eğer bucket yoksa oluştur (storage.buckets tablosuna insert)
INSERT INTO storage.buckets (id, name, public)
VALUES ('stories', 'stories', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Politikaları
-- 1. Public Select
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'stories' );

-- 2. Admin Upload
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'stories' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- 3. Admin Delete
CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'stories' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);
