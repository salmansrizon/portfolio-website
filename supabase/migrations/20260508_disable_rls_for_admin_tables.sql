-- Disable RLS for all admin tables to enable save functionality
-- Run this in Supabase SQL Editor

ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE certifications DISABLE ROW LEVEL SECURITY;

NOTIFY pgrst, 'reload schema';
