-- Create separate table for OTP tracking (keyed by phone number)
CREATE TABLE IF NOT EXISTS otp_requests (
    phone TEXT PRIMARY KEY,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE otp_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read/write (needed for login flow before auth)
CREATE POLICY "Allow public access to otp_requests" ON otp_requests
    FOR ALL USING (true) WITH CHECK (true);

-- Auto cleanup old records (optional - keeps table small)
-- Records older than 1 day can be safely deleted
CREATE INDEX IF NOT EXISTS idx_otp_requests_sent_at ON otp_requests(sent_at);
