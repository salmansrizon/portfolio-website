-- Create course_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS course_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES course_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on course_categories
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for course_categories
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access to categories' AND tablename = 'course_categories') THEN
        CREATE POLICY "Allow public read access to categories" ON course_categories FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin full access to categories' AND tablename = 'course_categories') THEN
        CREATE POLICY "Allow admin full access to categories" ON course_categories FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Add category_id to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES course_categories(id) ON DELETE SET NULL;

-- Ensure other JSONB/text array columns exist on courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS learning_outcomes TEXT[] DEFAULT '{}';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS requirements TEXT[] DEFAULT '{}';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS target_audience TEXT[] DEFAULT '{}';

-- Fix relation in course_enrollments if it's missing or named differently
-- (Supabase handles relationships via foreign keys automatically)
