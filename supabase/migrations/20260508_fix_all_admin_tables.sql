-- Comprehensive migration to fix all admin panel issues
-- Run this in Supabase SQL Editor

-- ============================================
-- FIX SERVICES TABLE
-- ============================================
ALTER TABLE services ADD COLUMN IF NOT EXISTS features text[] DEFAULT '{}';
ALTER TABLE services ADD COLUMN IF NOT EXISTS icon text DEFAULT NULL;

-- ============================================
-- FIX CERTIFICATIONS TABLE
-- ============================================
ALTER TABLE certifications ADD COLUMN IF NOT EXISTS credential_id text DEFAULT NULL;
ALTER TABLE certifications ADD COLUMN IF NOT EXISTS verification_url text DEFAULT NULL;
ALTER TABLE certifications ADD COLUMN IF NOT EXISTS image_url text DEFAULT NULL;
ALTER TABLE certifications ADD COLUMN IF NOT EXISTS earned_date date DEFAULT NULL;

-- ============================================
-- FIX BLOGS TABLE (if not already done)
-- ============================================
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS excerpt text DEFAULT NULL;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS featured_image text DEFAULT NULL;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'local';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS source_url text DEFAULT NULL;

-- ============================================
-- ENSURE ALL REQUIRED TABLES EXIST
-- ============================================

-- Webinars
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

-- Courses (if not exists)
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

-- Session Bookings
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

-- Page Views
CREATE TABLE IF NOT EXISTS page_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path text NOT NULL,
  visitor_id text,
  created_at timestamp with time zone DEFAULT now()
);

-- Instructors
CREATE TABLE IF NOT EXISTS instructors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  bio text,
  avatar_url text,
  expertise text[],
  created_at timestamp with time zone DEFAULT now()
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text,
  enrolled_courses uuid[],
  created_at timestamp with time zone DEFAULT now()
);

-- Course Categories
CREATE TABLE IF NOT EXISTS course_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Course Content
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

-- Course Reviews
CREATE TABLE IF NOT EXISTS course_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamp with time zone DEFAULT now()
);

-- Brand Logos
CREATE TABLE IF NOT EXISTS brand_logos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  logo_url text NOT NULL,
  website_url text,
  "order" integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Career Prep
CREATE TABLE IF NOT EXISTS career_prep (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  content jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Roadmaps
CREATE TABLE IF NOT EXISTS roadmaps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  content jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
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
-- CREATE PERMISSIVE POLICIES (FOR DEVELOPMENT)
-- ============================================
-- Services
DROP POLICY IF EXISTS "Allow all operations for anon" ON services;
CREATE POLICY "Allow all operations for anon" ON services FOR ALL USING (true) WITH CHECK (true);

-- Blogs
DROP POLICY IF EXISTS "Allow all operations for anon" ON blogs;
CREATE POLICY "Allow all operations for anon" ON blogs FOR ALL USING (true) WITH CHECK (true);

-- Webinars
DROP POLICY IF EXISTS "Allow all operations for anon" ON webinars;
CREATE POLICY "Allow all operations for anon" ON webinars FOR ALL USING (true) WITH CHECK (true);

-- Courses
DROP POLICY IF EXISTS "Allow all operations for anon" ON courses;
CREATE POLICY "Allow all operations for anon" ON courses FOR ALL USING (true) WITH CHECK (true);

-- Session Bookings
DROP POLICY IF EXISTS "Allow all operations for anon" ON session_bookings;
CREATE POLICY "Allow all operations for anon" ON session_bookings FOR ALL USING (true) WITH CHECK (true);

-- Page Views
DROP POLICY IF EXISTS "Allow all operations for anon" ON page_views;
CREATE POLICY "Allow all operations for anon" ON page_views FOR ALL USING (true) WITH CHECK (true);

-- Instructors
DROP POLICY IF EXISTS "Allow all operations for anon" ON instructors;
CREATE POLICY "Allow all operations for anon" ON instructors FOR ALL USING (true) WITH CHECK (true);

-- Students
DROP POLICY IF EXISTS "Allow all operations for anon" ON students;
CREATE POLICY "Allow all operations for anon" ON students FOR ALL USING (true) WITH CHECK (true);

-- Course Categories
DROP POLICY IF EXISTS "Allow all operations for anon" ON course_categories;
CREATE POLICY "Allow all operations for anon" ON course_categories FOR ALL USING (true) WITH CHECK (true);

-- Course Content
DROP POLICY IF EXISTS "Allow all operations for anon" ON course_content;
CREATE POLICY "Allow all operations for anon" ON course_content FOR ALL USING (true) WITH CHECK (true);

-- Course Reviews
DROP POLICY IF EXISTS "Allow all operations for anon" ON course_reviews;
CREATE POLICY "Allow all operations for anon" ON course_reviews FOR ALL USING (true) WITH CHECK (true);

-- Brand Logos
DROP POLICY IF EXISTS "Allow all operations for anon" ON brand_logos;
CREATE POLICY "Allow all operations for anon" ON brand_logos FOR ALL USING (true) WITH CHECK (true);

-- Career Prep
DROP POLICY IF EXISTS "Allow all operations for anon" ON career_prep;
CREATE POLICY "Allow all operations for anon" ON career_prep FOR ALL USING (true) WITH CHECK (true);

-- Roadmaps
DROP POLICY IF EXISTS "Allow all operations for anon" ON roadmaps;
CREATE POLICY "Allow all operations for anon" ON roadmaps FOR ALL USING (true) WITH CHECK (true);

-- Projects
DROP POLICY IF EXISTS "Allow all operations for anon" ON projects;
CREATE POLICY "Allow all operations for anon" ON projects FOR ALL USING (true) WITH CHECK (true);

-- Testimonials
DROP POLICY IF EXISTS "Allow all operations for anon" ON testimonials;
CREATE POLICY "Allow all operations for anon" ON testimonials FOR ALL USING (true) WITH CHECK (true);

-- Certifications
DROP POLICY IF EXISTS "Allow all operations for anon" ON certifications;
CREATE POLICY "Allow all operations for anon" ON certifications FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- REFRESH SCHEMA CACHE
-- ============================================
NOTIFY pgrst, 'reload schema';

-- ============================================
-- CREATE STORAGE BUCKETS (Reminder)
-- ============================================
-- Note: Storage buckets need to be created via Supabase Dashboard or API
-- Please create these buckets in your Supabase Dashboard > Storage:
-- 1. blog-images (public, image/*, 5MB limit)
-- 2. course-images (public, image/*, 5MB limit)
-- 3. instructor-avatars (public, image/*, 2MB limit)
-- 4. brand-logos (public, image/*, 2MB limit)
-- 5. webinar-images (public, image/*, 5MB limit)
