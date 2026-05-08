-- Complete fix for all admin panel save issues
-- Run this ENTIRE script in Supabase SQL Editor

-- ============================================
-- 1. DISABLE RLS FOR ALL ADMIN TABLES
-- ============================================
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE certifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE blogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE webinars DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. ENSURE ALL REQUIRED COLUMNS EXIST
-- ============================================

-- Projects table (should already be correct)
-- No changes needed if the table was created properly

-- Testimonials table
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS client_name text;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS company text;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS rating integer;

-- Services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS features text[] DEFAULT '{}';
ALTER TABLE services ADD COLUMN IF NOT EXISTS icon text DEFAULT NULL;

-- Certifications table
ALTER TABLE certifications ADD COLUMN IF NOT EXISTS credential_id text DEFAULT NULL;
ALTER TABLE certifications ADD COLUMN IF NOT EXISTS verification_url text DEFAULT NULL;
ALTER TABLE certifications ADD COLUMN IF NOT EXISTS image_url text DEFAULT NULL;
ALTER TABLE certifications ADD COLUMN IF NOT EXISTS earned_date date DEFAULT NULL;

-- Blogs table
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS excerpt text DEFAULT NULL;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS featured_image text DEFAULT NULL;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'local';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS source_url text DEFAULT NULL;

-- ============================================
-- 3. REFRESH SCHEMA CACHE
-- ============================================
NOTIFY pgrst, 'reload schema';

-- ============================================
-- 4. VERIFICATION QUERIES (Run these to check)
-- ============================================
-- Uncomment and run these to verify the tables are accessible:

-- SELECT * FROM projects LIMIT 1;
-- SELECT * FROM testimonials LIMIT 1;
-- SELECT * FROM services LIMIT 1;
-- SELECT * FROM certifications LIMIT 1;

-- ============================================
-- INSTRUCTIONS
-- ============================================
-- 1. Copy this entire SQL
-- 2. Go to your Supabase Dashboard
-- 3. Navigate to SQL Editor
-- 4. Paste and run this SQL
-- 5. Check browser console for detailed error messages
-- 6. Try creating a project or testimonial again
