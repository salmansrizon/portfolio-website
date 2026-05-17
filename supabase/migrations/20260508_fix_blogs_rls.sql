-- Fix RLS policies for blogs table
-- Run these commands one by one in Supabase SQL Editor

-- Option 1: Disable RLS (simplest for development - uncomment if needed)
-- ALTER TABLE blogs DISABLE ROW LEVEL SECURITY;

-- Align blog RLS with project tables (disable RLS for development)
-- This mirrors the approach used for the `projects` table in
-- `20260508_disable_rls_for_admin_tables.sql`.
-- Disabling RLS removes all row‑level restrictions, allowing unrestricted
-- reads and writes (suitable for local development). For production you
-- should enable RLS and define appropriate policies.

ALTER TABLE blogs DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might have been created previously.
DROP POLICY IF EXISTS "Public can view published blogs" ON blogs;
DROP POLICY IF EXISTS "Allow all operations for anon" ON blogs;
DROP POLICY IF EXISTS "Authenticated users can manage blogs" ON blogs;
