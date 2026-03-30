-- Add manual booked_count column to webinars table for social proof administration
ALTER TABLE webinars ADD COLUMN IF NOT EXISTS booked_count INTEGER DEFAULT 0;
