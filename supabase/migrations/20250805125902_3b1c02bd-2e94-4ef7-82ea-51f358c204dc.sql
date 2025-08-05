-- Add section_id column to course_content table to properly link content to sections
ALTER TABLE public.course_content ADD COLUMN section_id uuid REFERENCES public.course_sections(id) ON DELETE CASCADE;

-- Drop the old columns that are no longer needed
ALTER TABLE public.course_content DROP COLUMN IF EXISTS module_id;
ALTER TABLE public.course_content DROP COLUMN IF EXISTS submodule_id;

-- Update the content_category enum to match our new content types
DROP TYPE IF EXISTS content_type_enum CASCADE;
CREATE TYPE content_type_enum AS ENUM ('video', 'text', 'quiz', 'lesson', 'assignment', 'lecture');

-- Update the column to use the new enum type
ALTER TABLE public.course_content 
ALTER COLUMN content_category TYPE content_type_enum 
USING content_category::content_type_enum;