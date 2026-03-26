-- Add QR code image URLs to payment_settings
ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS bkash_qr_code TEXT;
ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS nagad_qr_code TEXT;

-- Add payment fields to course_enrollments
ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS transaction_id TEXT;
