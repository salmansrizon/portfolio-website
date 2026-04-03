
-- Add what_you_will_learn column to courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS what_you_will_learn JSONB DEFAULT '[]'::jsonb;
