-- Create blogs table
-- Use IF NOT EXISTS to avoid duplicate table errors when the simple blogs table already exists
CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create portfolio sections table
CREATE TABLE public.portfolio_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_name TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create certifications table
CREATE TABLE public.certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  credential_id TEXT,
  verification_url TEXT,
  image_url TEXT,
  earned_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  company TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view published blogs" 
ON public.blogs 
FOR SELECT 
USING (published = true);

CREATE POLICY "Anyone can view portfolio sections" 
ON public.portfolio_sections 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view certifications" 
ON public.certifications 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view services" 
ON public.services 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view testimonials" 
ON public.testimonials 
FOR SELECT 
USING (true);

-- Create admin policies (for now, allow all authenticated users to manage content)
-- You can restrict this to specific admin users later
CREATE POLICY "Authenticated users can manage blogs" 
ON public.blogs 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage portfolio sections" 
ON public.portfolio_sections 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage certifications" 
ON public.certifications 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage services" 
ON public.services 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage testimonials" 
ON public.testimonials 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_sections_updated_at
  BEFORE UPDATE ON public.portfolio_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial portfolio sections with current content
INSERT INTO public.portfolio_sections (section_name, content) VALUES
('hero', '{
  "title": "Microsoft Certified Analytics Engineer",
  "subtitle": "Turning Data into Strategic Insights",
  "description": "With expertise in Microsoft technologies and a passion for data-driven solutions, I help businesses unlock the power of their data through advanced analytics, reporting, and business intelligence.",
  "cta_primary": "View My Work",
  "cta_secondary": "Hire Me"
}'),
('about', '{
  "title": "About Me",
  "description": "I am a Microsoft Certified Analytics Engineer with extensive experience in data analytics, business intelligence, and cloud solutions. My journey in the tech industry has been driven by a passion for transforming raw data into actionable insights that drive business growth.",
  "stats": [
    {"label": "Years Experience", "value": "5+"},
    {"label": "Projects Completed", "value": "50+"},
    {"label": "Certifications", "value": "4"},
    {"label": "Client Satisfaction", "value": "100%"}
  ],
  "skills": [
    {"name": "Power BI", "percentage": 95},
    {"name": "Azure Analytics", "percentage": 90},
    {"name": "SQL Server", "percentage": 88},
    {"name": "Python", "percentage": 85},
    {"name": "Excel", "percentage": 92}
  ]
}'),
('contact', '{
  "title": "Let''s Work Together",
  "description": "Ready to transform your data into actionable insights? Let''s discuss your project requirements.",
  "email": "contact@sulaimanahmed.com",
  "phone": "+1 (555) 123-4567",
  "location": "Remote Worldwide",
  "social_links": {
    "linkedin": "https://linkedin.com/in/sulaimanahmed",
    "github": "https://github.com/sulaimanahmed",
    "twitter": "https://twitter.com/sulaimanahmed"
  }
}');

-- Insert initial services
INSERT INTO public.services (title, description, features, icon) VALUES
('Data Analytics & Reporting', 'Transform your raw data into meaningful insights with comprehensive analytics solutions and interactive dashboards.', 
 ARRAY['Custom Dashboard Development', 'KPI Tracking & Monitoring', 'Automated Reporting Solutions', 'Data Visualization', 'Performance Analytics'], 
 'BarChart3'),
('Business Intelligence Solutions', 'Build robust BI systems that empower your team to make data-driven decisions with confidence and clarity.', 
 ARRAY['Power BI Implementation', 'Data Warehouse Design', 'ETL Process Development', 'Self-Service Analytics', 'Mobile BI Solutions'], 
 'Brain'),
('Azure Cloud Analytics', 'Leverage Microsoft Azure''s powerful analytics services to scale your data operations and drive innovation.', 
 ARRAY['Azure Synapse Analytics', 'Data Factory Integration', 'Machine Learning Models', 'Real-time Analytics', 'Cloud Migration'], 
 'Cloud');

-- Insert initial certifications
INSERT INTO public.certifications (title, issuer, credential_id, verification_url, earned_date) VALUES
('Microsoft Certified: Azure Data Engineer Associate', 'Microsoft', 'DP-203', 'https://learn.microsoft.com/en-us/certifications/azure-data-engineer/', '2023-06-15'),
('Microsoft Certified: Power BI Data Analyst Associate', 'Microsoft', 'PL-300', 'https://learn.microsoft.com/en-us/certifications/power-bi-data-analyst-associate/', '2023-04-10'),
('Microsoft Certified: Azure Fundamentals', 'Microsoft', 'AZ-900', 'https://learn.microsoft.com/en-us/certifications/azure-fundamentals/', '2023-01-20'),
('Microsoft Certified: Data Analyst Associate', 'Microsoft', 'DA-100', 'https://learn.microsoft.com/en-us/certifications/data-analyst-associate/', '2023-08-05');

-- Insert initial testimonials
INSERT INTO public.testimonials (client_name, company, content, rating) VALUES
('Sarah Johnson', 'TechCorp Solutions', 'Sulaiman delivered exceptional analytics solutions that transformed how we view our business data. His expertise in Power BI and Azure is outstanding.', 5),
('Michael Chen', 'DataFlow Inc', 'Working with Sulaiman was a game-changer for our reporting processes. He created intuitive dashboards that our entire team now relies on daily.', 5),
('Emily Rodriguez', 'Growth Analytics', 'Professional, knowledgeable, and delivers results on time. Sulaiman''s data engineering skills helped us scale our analytics infrastructure seamlessly.', 5);