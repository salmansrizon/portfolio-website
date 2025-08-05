-- Add section_id column to course_content table to properly link content to sections
ALTER TABLE public.course_content ADD COLUMN section_id uuid REFERENCES public.course_sections(id) ON DELETE CASCADE;

-- Drop the old columns that are no longer needed (if they exist)
ALTER TABLE public.course_content DROP COLUMN IF EXISTS module_id;
ALTER TABLE public.course_content DROP COLUMN IF EXISTS submodule_id;

-- Update the content_type column to use varchar instead of enum to avoid conflicts
-- The content_type should support: 'video', 'text', 'quiz', 'lesson', 'assignment', 'lecture'