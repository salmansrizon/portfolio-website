-- Ensure all necessary sections exist with proper section names
INSERT INTO portfolio_sections (section_name, content) VALUES 
('services', '{"title": "My Services", "subtitle": "What I offer", "description": "Professional services I provide"}'),
('portfolio', '{"title": "My Portfolio", "subtitle": "Latest Projects", "description": "Check out my recent work"}'),
('testimonials', '{"title": "Client Testimonials", "subtitle": "What clients say", "description": "Feedback from satisfied clients"}'),
('certifications', '{"title": "Certifications", "subtitle": "Professional Credentials", "description": "My professional certifications and achievements"}')
ON CONFLICT (section_name) DO NOTHING;

-- Ensure the existing sections have proper default content structure
UPDATE portfolio_sections 
SET content = CASE 
  WHEN section_name = 'hero' AND (content->>'title') IS NULL THEN 
    '{"title": {"main": "Data Analytics", "highlight": "Expert"}, "subtitle": "Google Certified Analytics Engineer", "name": "Salman Sakib", "description": "Transforming complex data into actionable insights", "cta": {"primary": {"text": "View Portfolio", "link": "/portfolio"}, "secondary": {"text": "Contact Me", "link": "#contact"}}}'::jsonb
  WHEN section_name = 'about' AND (content->>'title') IS NULL THEN 
    '{"title": "About Me", "subtitle": "Data Analytics Professional", "professionalJourney": {"title": "Professional Journey", "description": "Experienced in data analysis and business intelligence"}, "stats": [{"number": "7+", "label": "Years Experience"}], "skills": [{"name": "Power BI", "percentage": 90}], "expertise": []}'::jsonb
  WHEN section_name = 'contact' AND (content->>'title') IS NULL THEN 
    '{"title": "Get In Touch", "description": "Let\'s discuss your project", "email": "contact@example.com", "phone": "+1234567890", "location": "Remote Worldwide"}'::jsonb
  ELSE content
END
WHERE section_name IN ('hero', 'about', 'contact');