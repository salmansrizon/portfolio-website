-- Add start_date column to courses table
ALTER TABLE public.courses 
ADD COLUMN start_date timestamp with time zone;