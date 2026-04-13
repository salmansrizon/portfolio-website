
CREATE TABLE public.roadmaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  markdown_content TEXT NOT NULL DEFAULT '',
  icon TEXT,
  banner_image TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published roadmaps"
ON public.roadmaps
FOR SELECT
USING (status = 'published');

CREATE POLICY "Authenticated users can manage roadmaps"
ON public.roadmaps
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE TRIGGER update_roadmaps_updated_at
BEFORE UPDATE ON public.roadmaps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
