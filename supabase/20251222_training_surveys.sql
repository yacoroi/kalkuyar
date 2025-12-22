-- ==============================================
-- İçerik Anketi Sistemi - Veritabanı Güncellemeleri
-- ==============================================

-- 1. trainings tablosuna survey_questions sütunu ekle
ALTER TABLE trainings
ADD COLUMN IF NOT EXISTS survey_questions JSONB DEFAULT NULL;

-- Örnek format:
-- [
--   { "id": "q1", "question": "Bu konuyu sahada nasıl kullanırsınız?", "type": "text" },
--   { "id": "q2", "question": "İçerik faydalı mıydı?", "type": "rating" }
-- ]

COMMENT ON COLUMN trainings.survey_questions IS 'JSON array of survey questions. Each item has id, question, and type (text/rating)';

-- 2. training_reads tablosuna survey_completed sütunu ekle
ALTER TABLE training_reads
ADD COLUMN IF NOT EXISTS survey_completed BOOLEAN DEFAULT FALSE;

-- 3. training_survey_responses tablosu oluştur
CREATE TABLE IF NOT EXISTS training_survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    training_id BIGINT NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
    responses JSONB NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, training_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_survey_responses_user_id ON training_survey_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_training_id ON training_survey_responses(training_id);

-- RLS Policies
ALTER TABLE training_survey_responses ENABLE ROW LEVEL SECURITY;

-- Users can insert their own responses
CREATE POLICY "Users can insert own survey responses"
ON training_survey_responses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own responses (needed for upsert)
CREATE POLICY "Users can update own survey responses"
ON training_survey_responses FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can view their own responses
CREATE POLICY "Users can view own survey responses"
ON training_survey_responses FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all responses
CREATE POLICY "Admins can view all survey responses"
ON training_survey_responses FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON training_survey_responses TO authenticated;
