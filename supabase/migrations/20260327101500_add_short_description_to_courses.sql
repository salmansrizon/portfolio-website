-- Add short_description to courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS short_description TEXT;
