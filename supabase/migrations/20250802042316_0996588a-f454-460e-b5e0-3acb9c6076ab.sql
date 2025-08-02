-- Add new columns to course_content table for hierarchy
ALTER TABLE course_content 
ADD COLUMN IF NOT EXISTS module_id UUID,
ADD COLUMN IF NOT EXISTS submodule_id UUID;

-- Add foreign key constraints for the hierarchy
ALTER TABLE course_content 
ADD CONSTRAINT fk_course_content_module 
FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE;

ALTER TABLE course_content 
ADD CONSTRAINT fk_course_content_submodule 
FOREIGN KEY (submodule_id) REFERENCES course_submodules(id) ON DELETE CASCADE;

-- Update course_submodules to reference modules properly if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'fk_course_submodules_module') THEN
    ALTER TABLE course_submodules 
    ADD CONSTRAINT fk_course_submodules_module 
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update course_modules to reference courses properly if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'fk_course_modules_course') THEN
    ALTER TABLE course_modules 
    ADD CONSTRAINT fk_course_modules_course 
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create content_type enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_type_enum') THEN
    CREATE TYPE content_type_enum AS ENUM ('lesson', 'quiz', 'project', 'assignment', 'text', 'video');
  END IF;
END $$;

-- Add a new column with the enum type instead of changing existing
ALTER TABLE course_content 
ADD COLUMN IF NOT EXISTS content_category content_type_enum DEFAULT 'lesson';

-- Update existing data based on content_type
UPDATE course_content 
SET content_category = CASE 
  WHEN content_type = 'text' THEN 'lesson'::content_type_enum
  WHEN content_type = 'video' THEN 'lesson'::content_type_enum
  ELSE 'lesson'::content_type_enum
END;