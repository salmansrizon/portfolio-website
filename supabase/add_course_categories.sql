-- Create the course_categories table to support hierarchy
CREATE TABLE IF NOT EXISTS course_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES course_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Recommended Index for hierarchy lookups
CREATE INDEX IF NOT EXISTS idx_course_categories_parent ON course_categories(parent_id);

-- Insert some default parent categories
INSERT INTO course_categories (name, slug) VALUES 
('Business', 'business'),
('Technology', 'technology'),
('Design', 'design')
ON CONFLICT DO NOTHING;

-- Insert a child category example (assuming 'Business' got an ID, this requires a subquery or you can insert via UI later)
-- Example: INSERT INTO course_categories (name, slug, parent_id) VALUES ('Human Resources', 'human-resources', (SELECT id FROM course_categories WHERE slug = 'business'));

-- Add category reference to your existing courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES course_categories(id);

-- Refresh the postgrest schema cache
NOTIFY pgrst, 'reload schema';
