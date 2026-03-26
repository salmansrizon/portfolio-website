
CREATE TABLE public.brand_logos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text NOT NULL,
  website_url text,
  hover_text text,
  order_index integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_logos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible brand logos" ON public.brand_logos
  FOR SELECT TO public USING (is_visible = true);

CREATE POLICY "Authenticated users can manage brand logos" ON public.brand_logos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
