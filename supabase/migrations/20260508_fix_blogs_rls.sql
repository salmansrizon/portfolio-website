-- Fix RLS policies for blogs table
-- Run these commands one by one in Supabase SQL Editor

-- Option 1: Disable RLS (simplest for development - uncomment if needed)
-- ALTER TABLE blogs DISABLE ROW LEVEL SECURITY;

-- Option 2: Add permissive RLS policies (recommended)
-- First, enable RLS if not already enabled
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published blogs
DROP POLICY IF EXISTS "Public can view published blogs" ON blogs;
CREATE POLICY "Public can view published blogs" 
  ON blogs FOR SELECT 
  USING (published = true OR published IS NULL);

-- Allow all operations for anon key (for development)
-- This allows the anon key (used by default in your client) to do all operations
DROP POLICY IF EXISTS "Allow all operations for anon" ON blogs;
CREATE POLICY "Allow all operations for anon" 
  ON blogs FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Note: For production, you should use authenticated policies instead:
-- DROP POLICY IF EXISTS "Authenticated users can manage blogs" ON blogs;
-- CREATE POLICY "Authenticated users can manage blogs" 
--   ON blogs FOR ALL 
--   USING (auth.role() = 'authenticated')
--   WITH CHECK (auth.role() = 'authenticated');
