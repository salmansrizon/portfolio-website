-- Update course_content_content_type_check constraint to include more type options
ALTER TABLE public.course_content 
DROP CONSTRAINT IF EXISTS course_content_content_type_check;

ALTER TABLE public.course_content 
ADD CONSTRAINT course_content_content_type_check 
CHECK (content_type IN ('video', 'text', 'quiz', 'lesson', 'assignment', 'lecture', 'project'));
