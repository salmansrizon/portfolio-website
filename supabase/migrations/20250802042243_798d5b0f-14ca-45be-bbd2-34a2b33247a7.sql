-- Update course_content table to support the new hierarchy
ALTER TABLE course_content 
ADD COLUMN module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
ADD COLUMN submodule_id UUID REFERENCES course_submodules(id) ON DELETE CASCADE;

-- Update course_submodules to reference modules properly
ALTER TABLE course_submodules 
ADD CONSTRAINT fk_course_submodules_module 
FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE;

-- Update course_modules to reference courses properly  
ALTER TABLE course_modules 
ADD CONSTRAINT fk_course_modules_course 
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

-- Add content_type enum for better organization
CREATE TYPE content_type_enum AS ENUM ('lesson', 'quiz', 'project', 'assignment');

-- Update course_content to use the enum
ALTER TABLE course_content 
ALTER COLUMN content_type TYPE content_type_enum USING content_type::content_type_enum;

-- Enable RLS policies for the hierarchy tables
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_submodules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for course_modules
CREATE POLICY "Anyone can view course modules" 
ON course_modules FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage course modules" 
ON course_modules FOR ALL USING (true) WITH CHECK (true);

-- Create RLS policies for course_submodules  
CREATE POLICY "Anyone can view course submodules" 
ON course_submodules FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage course submodules" 
ON course_submodules FOR ALL USING (true) WITH CHECK (true);

-- Update course_content RLS policies
DROP POLICY IF EXISTS "Anyone can view course content" ON course_content;
DROP POLICY IF EXISTS "Authenticated users can manage course content" ON course_content;

CREATE POLICY "Anyone can view course content" 
ON course_content FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage course content" 
ON course_content FOR ALL USING (true) WITH CHECK (true);