-- Concepts: the four-part explanation (what it is, why it matters, how it
-- works, an analogy) shown on a Step, in the solve workspace, and after a
-- failed Checkpoint.
--
-- A Concept is deliberately NOT a row in careerprep_questions — see
-- docs/adr/0003-a-concept-is-not-a-question.md. A Question is defined by having
-- an answer to grade; a Concept has none, and that table is read by
-- start_assessment and swept by sync_exam_twin() on every write.
--
-- Written once, attached many times: the same "window functions" explanation
-- serves the Roadmap Step, the Library questions that test it, and the
-- Checkpoint a learner just failed. Attaching rather than owning is what stops
-- one explanation becoming five copies that drift.

CREATE TABLE IF NOT EXISTS public.concepts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text NOT NULL UNIQUE,
  title          text NOT NULL,
  -- The four parts are separate columns, not one markdown blob: the analogy is
  -- the part authors skip when it is optional, and it is the part that does the
  -- work. Separate fields also make a half-written Concept obvious.
  what_it_is     text NOT NULL,
  why_it_matters text NOT NULL,
  how_it_works   text NOT NULL,
  analogy        text NOT NULL,
  -- No difficulty and no industry: a Concept is never attempted, so it has no
  -- difficulty, and it is not part of the personalization axis.
  status         text NOT NULL DEFAULT 'draft',
  -- Recorded so a Bengali version can be added later without a schema change.
  language       text NOT NULL DEFAULT 'en',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- ── Attachments ─────────────────────────────────────────────────────────────
-- Same (roadmap_id, step_slug) shape Checkpoints already use, so a Concept
-- attaches where the Step is authored rather than through a mapping screen.

CREATE TABLE IF NOT EXISTS public.concept_steps (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id  uuid NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  roadmap_id  uuid NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  step_slug   text NOT NULL,
  order_index int  NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (concept_id, roadmap_id, step_slug)
);

CREATE TABLE IF NOT EXISTS public.concept_questions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id  uuid NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.careerprep_questions(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (concept_id, question_id)
);

CREATE INDEX IF NOT EXISTS concept_steps_step_idx     ON public.concept_steps (roadmap_id, step_slug);
CREATE INDEX IF NOT EXISTS concept_questions_q_idx    ON public.concept_questions (question_id);

-- ── RLS ─────────────────────────────────────────────────────────────────────
-- Public read, published only. A half-written explanation is worse than none,
-- for the same reason an unpublished Roadmap is skipped rather than shown.

ALTER TABLE public.concepts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concept_steps     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concept_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published concepts" ON public.concepts;
CREATE POLICY "Public read published concepts"
  ON public.concepts FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Admins manage concepts" ON public.concepts;
CREATE POLICY "Admins manage concepts"
  ON public.concepts FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- The attachment tables carry no content of their own, so they are readable by
-- anyone; what they point at is still filtered by the policy above.
DROP POLICY IF EXISTS "Public read concept_steps" ON public.concept_steps;
CREATE POLICY "Public read concept_steps"
  ON public.concept_steps FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage concept_steps" ON public.concept_steps;
CREATE POLICY "Admins manage concept_steps"
  ON public.concept_steps FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public read concept_questions" ON public.concept_questions;
CREATE POLICY "Public read concept_questions"
  ON public.concept_questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage concept_questions" ON public.concept_questions;
CREATE POLICY "Admins manage concept_questions"
  ON public.concept_questions FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());
