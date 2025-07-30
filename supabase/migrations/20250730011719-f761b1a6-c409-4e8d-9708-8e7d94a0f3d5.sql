-- Add course sections table for managing dynamic course page sections
CREATE TABLE public.course_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL,
  section_type TEXT NOT NULL, -- 'what_you_learn', 'who_is_for', 'prerequisites', 'benefits', 'objectives', 'curriculum', 'projects', 'testimonials', 'instructors', 'faqs'
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view course sections" 
ON public.course_sections 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage course sections" 
ON public.course_sections 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_course_sections_updated_at
BEFORE UPDATE ON public.course_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default sections for existing courses
INSERT INTO public.course_sections (course_id, section_type, title, content, order_index)
SELECT 
  c.id,
  'what_you_learn' as section_type,
  'What You Will Learn' as title,
  '{"items": ["Fundamental concepts", "Practical skills", "Industry best practices", "Real-world projects"]}' as content,
  1 as order_index
FROM public.courses c
WHERE c.status = 'published';

INSERT INTO public.course_sections (course_id, section_type, title, content, order_index)
SELECT 
  c.id,
  'who_is_for' as section_type,
  'Who This Course Is For' as title,
  '{"items": ["Beginners in the field", "Professionals looking to upskill", "Students", "Career changers"]}' as content,
  2 as order_index
FROM public.courses c
WHERE c.status = 'published';

INSERT INTO public.course_sections (course_id, section_type, title, content, order_index)
SELECT 
  c.id,
  'prerequisites' as section_type,
  'Prerequisites' as title,
  '{"items": ["Basic computer knowledge", "Internet browsing skills", "Willingness to learn"]}' as content,
  3 as order_index
FROM public.courses c
WHERE c.status = 'published';

INSERT INTO public.course_sections (course_id, section_type, title, content, order_index)
SELECT 
  c.id,
  'benefits' as section_type,
  'Course Benefits' as title,
  '{"items": ["Expert-created content", "Practical assignments", "Live mentor support", "Placement assistance", "100% online learning"]}' as content,
  4 as order_index
FROM public.courses c
WHERE c.status = 'published';

INSERT INTO public.course_sections (course_id, section_type, title, content, order_index)
SELECT 
  c.id,
  'objectives' as section_type,
  'Course Objectives' as title,
  '{"items": [{"icon": "target", "title": "Build Career Skills", "description": "Develop industry-relevant skills"}, {"icon": "briefcase", "title": "Get Job Ready", "description": "Prepare for professional roles"}, {"icon": "chart", "title": "Advanced Analysis", "description": "Master advanced techniques"}]}' as content,
  5 as order_index
FROM public.courses c
WHERE c.status = 'published';