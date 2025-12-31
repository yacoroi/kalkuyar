-- Add push notification and activity tracking columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS push_token TEXT,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for finding inactive users (for scheduled notifications)
CREATE INDEX IF NOT EXISTS idx_profiles_last_active_at ON profiles(last_active_at);

-- Create index for push token lookup
CREATE INDEX IF NOT EXISTS idx_profiles_push_token ON profiles(push_token) WHERE push_token IS NOT NULL;
