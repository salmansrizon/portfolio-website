-- Ensure all necessary sections exist with proper section names
INSERT INTO portfolio_sections (section_name, content) VALUES 
('services', '{"title": "My Services", "subtitle": "What I offer", "description": "Professional services I provide"}'),
('portfolio', '{"title": "My Portfolio", "subtitle": "Latest Projects", "description": "Check out my recent work"}'),
('testimonials', '{"title": "Client Testimonials", "subtitle": "What clients say", "description": "Feedback from satisfied clients"}'),
('certifications', '{"title": "Certifications", "subtitle": "Professional Credentials", "description": "My professional certifications and achievements"}')
ON CONFLICT (section_name) DO NOTHING;