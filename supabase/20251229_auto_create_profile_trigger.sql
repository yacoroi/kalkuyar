-- ============================================
-- Auto-create profile and sync phone for new users
-- Date: 2025-12-29
-- ============================================
-- This trigger automatically:
--   1. Creates a profile when a new user registers
--   2. Syncs phone number (converting 90xxx to 0xxx format)

-- Drop existing triggers first
DROP TRIGGER IF EXISTS on_auth_user_phone_update ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the main trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    formatted_phone TEXT;
BEGIN
    -- Format phone number: 90XXXXXXXXXX -> 0XXXXXXXXXX
    IF NEW.phone IS NOT NULL AND NEW.phone LIKE '90%' THEN
        formatted_phone := '0' || SUBSTRING(NEW.phone FROM 3);
    ELSE
        formatted_phone := NEW.phone;
    END IF;

    -- On INSERT: Create new profile
    IF TG_OP = 'INSERT' THEN
        INSERT INTO profiles (id, full_name, phone, created_at)
        VALUES (
            NEW.id,
            COALESCE(
                NEW.raw_user_meta_data->>'full_name',
                NEW.raw_user_meta_data->>'name',
                'Kullanıcı'
            ),
            formatted_phone,
            NEW.created_at
        )
        ON CONFLICT (id) DO UPDATE SET
            phone = COALESCE(EXCLUDED.phone, profiles.phone);
    
    -- On UPDATE: Just update the phone
    ELSIF TG_OP = 'UPDATE' AND NEW.phone IS NOT NULL THEN
        UPDATE profiles
        SET phone = formatted_phone
        WHERE id = NEW.id
        AND (phone IS NULL OR phone = '' OR phone != formatted_phone);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for both INSERT and UPDATE
CREATE TRIGGER on_auth_user_created
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- Verify trigger is created
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
