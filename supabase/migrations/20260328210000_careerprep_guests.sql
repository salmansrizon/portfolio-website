-- ─────────────────────────────────────────────────────────────
-- Career Prep: Guest Registration Table
-- Stores guest user info when they unlock a challenge
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS careerprep_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_active_at TIMESTAMPTZ DEFAULT now()
);

-- Unique constraint on email to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_careerprep_guests_email ON careerprep_guests(email);

-- Enable RLS
ALTER TABLE careerprep_guests ENABLE ROW LEVEL SECURITY;

-- Allow public insert (guests are unauthenticated)
CREATE POLICY "Allow public insert to careerprep_guests" ON careerprep_guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select careerprep_guests" ON careerprep_guests FOR SELECT USING (true);
CREATE POLICY "Allow public update careerprep_guests" ON careerprep_guests FOR UPDATE USING (true);

-- Also add guest columns to submissions table for linking
ALTER TABLE careerprep_submissions
  ADD COLUMN IF NOT EXISTS guest_email TEXT,
  ADD COLUMN IF NOT EXISTS guest_whatsapp TEXT;

-- Make student_id nullable so guests can submit without a student FK
ALTER TABLE careerprep_submissions
  ALTER COLUMN student_id DROP NOT NULL;
