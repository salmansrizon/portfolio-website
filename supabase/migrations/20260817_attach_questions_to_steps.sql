-- Attaches Questions to Roadmap Steps, which is what makes a Checkpoint possible.
--
-- A Checkpoint is not its own entity: it is an MCQ Question attached to a leaf
-- Step (decision 4 of ticket 03). That reuses careerprep_questions, the MCQ
-- machinery and the existing admin screen instead of duplicating all three.
--
-- `step_slug` refers to the author-stable {#slug} in the Roadmap markdown, not
-- to any row — the same key `step_progress` uses. Renaming a slug detaches the
-- Checkpoint, which is the accepted cost of markdown authoring.

ALTER TABLE public.careerprep_questions
  ADD COLUMN IF NOT EXISTS roadmap_id uuid REFERENCES public.roadmaps(id) ON DELETE SET NULL;

ALTER TABLE public.careerprep_questions
  ADD COLUMN IF NOT EXISTS step_slug text;

CREATE INDEX IF NOT EXISTS careerprep_questions_step_idx
  ON public.careerprep_questions (roadmap_id, step_slug);
