-- Add session_id to submissions for tracking anonymous progress
ALTER TABLE careerprep_submissions
  ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Index for session-based lookups
CREATE INDEX IF NOT EXISTS idx_careerprep_submissions_session_id ON careerprep_submissions(session_id);

-- Optional: Add stats columns to guests for faster lookups
ALTER TABLE careerprep_guests
  ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
