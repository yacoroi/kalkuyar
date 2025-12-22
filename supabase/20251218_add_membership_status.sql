-- Add membership_status column to reports table
-- Options: 'üye_oldu', 'gönüllü', 'kararsız', 'üyelik_istemiyor'

ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS membership_status TEXT;

-- Add comment for documentation
COMMENT ON COLUMN reports.membership_status IS 'Üyelik daveti sonucu: üye_oldu, gönüllü, kararsız, üyelik_istemiyor';
