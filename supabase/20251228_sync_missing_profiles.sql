-- ============================================
-- Sync Missing Profiles from auth.users
-- Date: 2025-12-28
-- ============================================
-- Problem: 228 users in auth.users, only 161 in profiles
-- This script will:
--   1. Create missing profile records
--   2. Sync phone numbers for all users

-- 1. First, let's see how many profiles are missing (just for verification)
-- Run this SELECT first to see the count:
-- SELECT COUNT(*) as missing_profiles 
-- FROM auth.users au 
-- WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id);

-- 2. Insert missing profiles from auth.users (ONLY verified users)
INSERT INTO profiles (id, full_name, phone, created_at)
SELECT 
    au.id,
    COALESCE(
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name',
        'Kullanıcı'
    ) as full_name,
    CASE 
        WHEN au.phone LIKE '90%' THEN '0' || SUBSTRING(au.phone FROM 3)
        ELSE au.phone
    END as phone,
    au.created_at
FROM auth.users au
WHERE au.phone_confirmed_at IS NOT NULL  -- Only verified users
AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id)
ON CONFLICT (id) DO NOTHING;

-- 3. Update phone numbers for existing profiles that have NULL or empty phone
UPDATE profiles p
SET 
    phone = CASE 
        WHEN au.phone LIKE '90%' THEN '0' || SUBSTRING(au.phone FROM 3)
        ELSE au.phone
    END
FROM auth.users au
WHERE p.id = au.id
AND au.phone IS NOT NULL
AND (p.phone IS NULL OR p.phone = '');

-- 4. Verify the sync (run these after to confirm)
-- SELECT COUNT(*) as total_auth_users FROM auth.users;
-- SELECT COUNT(*) as total_profiles FROM profiles;
-- SELECT COUNT(*) as profiles_with_phone FROM profiles WHERE phone IS NOT NULL AND phone != '';
