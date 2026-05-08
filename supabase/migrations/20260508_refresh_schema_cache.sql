-- Refresh Supabase schema cache to recognize new columns
-- Run this in Supabase SQL Editor

-- This command forces Supabase to reload the schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the columns exist by running these queries (optional):
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'demo_url';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'github_url';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'image_url';
