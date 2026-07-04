-- Seed portfolio_sections with the copy currently hardcoded in the public components,
-- so the admin Section Management editor pre-fills with what is actually live.
-- Inserts only when a section row is missing; never overwrites admin edits.

WITH seed(section_name, content, order_index) AS (
  VALUES
    ('hero', '{
      "title": {"main": "Transforming Data into", "highlight": "Strategic Insights"},
      "subtitle": "Google Certified Data Analytics Professional",
      "name": "Salman Sakib",
      "description": "Google Certified Analytics Engineer with 7+ years of experience transforming complex data into actionable insights. Specializing in data driven business growth with data analysis and data engineering solutions.",
      "cta": {
        "primary": {"text": "Book 1-1 Session", "link": "/book-session"},
        "secondary": {"text": "Get in Touch", "link": "#contact"}
      }
    }'::jsonb, 0),
    ('about', '{
      "title": "About Me",
      "subtitle": "Turning complex data into clear, actionable insights",
      "professionalJourney": {
        "title": "Professional Journey",
        "description": "Currently serving as Head of Business Intelligence at Cartup Limited, I specialize in transforming complex financial and business data into actionable insights. With over 7 years of experience across Fintech, consulting, and education sectors, I''ve helped organizations optimize their data strategies and make informed decisions."
      },
      "stats": [
        {"number": "7+", "label": "Years Experience"},
        {"number": "30+", "label": "Successful Projects"},
        {"number": "10+", "label": "Satisfied Clients"},
        {"number": "4+", "label": "Industry Catered"}
      ],
      "skills": [
        {"name": "Power BI", "percentage": 95},
        {"name": "Tableau", "percentage": 80},
        {"name": "Metabase", "percentage": 90},
        {"name": "SQL", "percentage": 90},
        {"name": "Python", "percentage": 85},
        {"name": "Data Visualization", "percentage": 95}
      ],
      "expertise": []
    }'::jsonb, 1),
    ('services', '{
      "title": "Services",
      "subtitle": "Comprehensive data analytics solutions tailored to your business needs",
      "description": ""
    }'::jsonb, 2),
    ('portfolio', '{
      "title": "Portfolio",
      "subtitle": "",
      "description": "A showcase of my projects and technical implementations"
    }'::jsonb, 3),
    ('testimonials', '{
      "title": "Client Testimonials",
      "subtitle": "What clients say about working with me",
      "description": ""
    }'::jsonb, 4),
    ('certifications', '{
      "title": "Certifications",
      "subtitle": "Validated expertise in data and analytics",
      "description": ""
    }'::jsonb, 5),
    ('teaching', '{
      "title": "Teaching & Mentoring",
      "subtitle": "",
      "description": "As an instructor at DScentral, I''m passionate about sharing knowledge and helping the next generation of data professionals. I provide corporate training, one-on-one mentoring, and workshop facilitation."
    }'::jsonb, 6),
    ('contact', '{
      "title": "Let''s Work Together",
      "description": "Ready to transform your data into strategic insights?",
      "email": "salmansrizon2016@gmail.com",
      "phone": "",
      "location": "Dhaka, Bangladesh"
    }'::jsonb, 7)
)
INSERT INTO public.portfolio_sections (section_name, content, status, section_type, order_index)
SELECT s.section_name, s.content, 'published', 'predefined', s.order_index
FROM seed s
WHERE NOT EXISTS (
  SELECT 1 FROM public.portfolio_sections p WHERE p.section_name = s.section_name
);
