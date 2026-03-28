-- ─────────────────────────────────────────────────────────────
-- Career Prep: Hierarchical Question Support
-- Adds: category, tags, question_type, parent_id, time_limit,
--        options (MCQ), correct_option, order_index
-- ─────────────────────────────────────────────────────────────

-- 1. Question type enum
DO $$ BEGIN
  CREATE TYPE careerprep_question_type AS ENUM (
    'root',          -- Top-level case study / mock test container
    'code',          -- SQL / code challenge (existing default)
    'mcq',           -- Multiple-choice question
    'case_study'     -- Descriptive / essay scenario
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. New columns on careerprep_questions
ALTER TABLE public.careerprep_questions
  ADD COLUMN IF NOT EXISTS question_type   careerprep_question_type NOT NULL DEFAULT 'code',
  ADD COLUMN IF NOT EXISTS parent_id       UUID REFERENCES public.careerprep_questions(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS category        TEXT,
  ADD COLUMN IF NOT EXISTS tags            TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS time_limit_secs INT,          -- per-question time limit (seconds), NULL = unlimited
  ADD COLUMN IF NOT EXISTS order_index     INT DEFAULT 0, -- ordering within a root question
  -- MCQ columns
  ADD COLUMN IF NOT EXISTS options         JSONB DEFAULT '[]'::jsonb,   -- [{label:"A", text:"…"}, …]
  ADD COLUMN IF NOT EXISTS correct_option  TEXT;                         -- "A" | "B" | "C" | "D"

-- 3. Index for fast child-question lookups
CREATE INDEX IF NOT EXISTS idx_careerprep_questions_parent_id
  ON public.careerprep_questions(parent_id);

-- 4. hints column (idempotent — may already exist)
ALTER TABLE public.careerprep_questions
  ADD COLUMN IF NOT EXISTS hints JSONB DEFAULT '[]'::jsonb;
