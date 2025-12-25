-- Sync phone numbers from auth.users to profiles table
-- Transform 90XXXXXXXXXX to 0XXXXXXXXXX format

-- First, update all existing profiles with phone from auth.users (converting format)
UPDATE profiles p
SET phone = '0' || SUBSTRING(au.phone FROM 3)
FROM auth.users au
WHERE p.id = au.id
AND au.phone IS NOT NULL
AND au.phone LIKE '90%'
AND (p.phone IS NULL OR p.phone = '' OR p.phone LIKE '90%');

-- Create a trigger function to sync phone on user updates (with format conversion)
CREATE OR REPLACE FUNCTION sync_phone_to_profile()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.phone IS NOT NULL THEN
        -- Convert 90XXXXXXXXXX to 0XXXXXXXXXX
        IF NEW.phone LIKE '90%' THEN
            UPDATE profiles
            SET phone = '0' || SUBSTRING(NEW.phone FROM 3)
            WHERE id = NEW.id;
        ELSE
            UPDATE profiles
            SET phone = NEW.phone
            WHERE id = NEW.id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync phone when auth.users is updated
DROP TRIGGER IF EXISTS on_auth_user_phone_update ON auth.users;
CREATE TRIGGER on_auth_user_phone_update
AFTER INSERT OR UPDATE OF phone ON auth.users
FOR EACH ROW
EXECUTE FUNCTION sync_phone_to_profile();
