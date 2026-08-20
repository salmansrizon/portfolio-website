-- Sub-topic cards: the second layer of a Topic.
--
-- The Topic card answers "what is this and why do I care" in four fields. That
-- is the right size for a first read and the wrong size for understanding, so a
-- Topic now carries ordered sections — one per facet worth its own card
-- (cross-encoder vs bi-encoder; the latency budget; when to skip a reranker).
--
-- A section is deliberately NOT a Topic: it has no slug, no URL, no checkpoint
-- and no progress. Promoting one to a full Topic later is an insert, not a
-- migration. Making every facet a Topic today would give the Journey a hundred
-- entries and a progress bar nobody can finish.

CREATE TABLE IF NOT EXISTS public.topic_sections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id    uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  title       text NOT NULL,
  body        text NOT NULL,
  -- The one-line takeaway. Optional, because not every facet has a good one and
  -- a forced analogy is worse than none.
  takeaway    text,
  order_index int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS topic_sections_topic_idx ON public.topic_sections (topic_id, order_index);

ALTER TABLE public.topic_sections ENABLE ROW LEVEL SECURITY;

-- Sections carry no independent publish state: they are part of their Topic, so
-- a draft Topic hides its sections by hiding itself.
DROP POLICY IF EXISTS "Public read topic_sections" ON public.topic_sections;
CREATE POLICY "Public read topic_sections" ON public.topic_sections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage topic_sections" ON public.topic_sections;
CREATE POLICY "Admins manage topic_sections" ON public.topic_sections FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- A Question attached to a Topic is practice, the Topic's single Checkpoint, or
-- a case study — a scenario worked through as a sequence. The case study role
-- exists so the Topic page can present them separately: "apply it" is a
-- different invitation from "test yourself".
ALTER TABLE public.topic_questions DROP CONSTRAINT IF EXISTS topic_questions_role_check;
ALTER TABLE public.topic_questions
  ADD CONSTRAINT topic_questions_role_check
  CHECK (role IN ('practice', 'checkpoint', 'case_study'));
