-- Add is_paid column to session_types table
-- Allows admin to mark a session as free (is_paid = false) or paid (is_paid = true)
ALTER TABLE public.session_types
  ADD COLUMN IF NOT EXISTS is_paid BOOLEAN NOT NULL DEFAULT true;

-- Update existing session types to be paid by default (already ensured by DEFAULT true)
-- No data migration needed; default covers existing rows
