-- Comprehensive migration to fix all schema issues
-- Run this in Supabase SQL Editor

-- ============================================
-- BLOGS TABLE
-- ============================================
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS excerpt text DEFAULT NULL;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS featured_image text DEFAULT NULL;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'local';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS source_url text DEFAULT NULL;

-- ============================================
-- WEBINARS TABLE (if exists or create)
-- ============================================
CREATE TABLE IF NOT EXISTS webinars (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  date timestamp with time zone,
  duration text,
  price numeric DEFAULT 0,
  currency text DEFAULT 'BDT',
  meeting_link text,
  status text DEFAULT 'draft',
  featured_image text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- COURSES TABLE (if exists or create)
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  price numeric DEFAULT 0,
  currency text DEFAULT 'BDT',
  duration text,
  level text,
  status text DEFAULT 'draft',
  featured_image text,
  instructor_id uuid,
  category_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- SESSION BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS session_bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  session_type text,
  booking_date date,
  booking_time time,
  message text,
  booking_status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- PAGE VIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS page_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path text NOT NULL,
  visitor_id text,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- INSTRUCTORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS instructors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  bio text,
  avatar_url text,
  expertise text[],
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- STUDENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text,
  enrolled_courses uuid[],
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- COURSE CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS course_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- COURSE CONTENT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS course_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content_type text DEFAULT 'video',
  content_url text,
  duration text,
  "order" integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- COURSE REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS course_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- BRAND LOGOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS brand_logos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  logo_url text NOT NULL,
  website_url text,
  "order" integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- CAREER PREP TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS career_prep (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  content jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- ROADMAPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roadmaps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  content jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_prep ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE PERMISSIVE RLS POLICIES (FOR DEVELOPMENT)
-- ============================================
-- Drop existing policies first
DROP POLICY IF EXISTS "Allow all operations for anon" ON blogs;
DROP POLICY IF EXISTS "Allow all operations for anon" ON webinars;
DROP POLICY IF EXISTS "Allow all operations for anon" ON courses;
DROP POLICY IF EXISTS "Allow all operations for anon" ON session_bookings;
DROP POLICY IF EXISTS "Allow all operations for anon" ON page_views;
DROP POLICY IF EXISTS "Allow all operations for anon" ON instructors;
DROP POLICY IF EXISTS "Allow all operations for anon" ON students;
DROP POLICY IF EXISTS "Allow all operations for anon" ON course_categories;
DROP POLICY IF EXISTS "Allow all operations for anon" ON course_content;
DROP POLICY IF EXISTS "Allow all operations for anon" ON course_reviews;
DROP POLICY IF EXISTS "Allow all operations for anon" ON brand_logos;
DROP POLICY IF EXISTS "Allow all operations for anon" ON career_prep;
DROP POLICY IF EXISTS "Allow all operations for anon" ON roadmaps;

-- Create new policies that allow all operations for anon key (for development)
CREATE POLICY "Allow all operations for anon" ON blogs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON webinars FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON session_bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON page_views FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON instructors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON course_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON course_content FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON course_reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON brand_logos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON career_prep FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON roadmaps FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- ENABLE REALTIME FOR KEY TABLES
-- ============================================
DO $$
BEGIN
  -- Enable realtime for blogs
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'blogs') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE blogs;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  -- Enable realtime for courses
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'courses') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE courses;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- ============================================
-- REFRESH SCHEMA CACHE
-- ============================================
NOTIFY pgrst, 'reload schema';

-- ============================================
-- CREATE STORAGE BUCKETS (if not exist)
-- ============================================
-- Note: Storage buckets need to be created via Supabase Dashboard or API
-- This is a comment to remind you to create these buckets:
-- 1. blog-images (public, image/*, 5MB limit)
-- 2. course-images (public, image/*, 5MB limit)
-- 3. instructor-avatars (public, image/*, 2MB limit)
-- 4. brand-logos (public, image/*, 2MB limit)
