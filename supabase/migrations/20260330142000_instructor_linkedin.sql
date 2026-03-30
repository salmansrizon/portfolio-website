-- Add linkedin_url column to instructors table
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
