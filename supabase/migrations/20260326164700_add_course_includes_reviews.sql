-- Add course_includes (TEXT[]) to courses table for admin-configurable "This course includes" section
ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_includes TEXT[] DEFAULT '{}';

-- Add instructor_id to courses table to link assigned instructor
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL;

-- Create course_reviews table for student reviews
CREATE TABLE IF NOT EXISTS course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on course_reviews
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for course_reviews
CREATE POLICY "Allow public read approved reviews" ON course_reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Allow anyone to insert reviews" ON course_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated to manage reviews" ON course_reviews FOR ALL USING (auth.role() = 'authenticated');
