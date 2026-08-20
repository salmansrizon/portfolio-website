-- Career Prep stops borrowing the Roadmap's structure and owns its own.
--
-- Reverses the Roadmap/Track merge from ticket 03. A Roadmap is now a standalone
-- reference — role description, timeline, topic sequence, read end to end — and
-- an *authoring input* for Career Prep, never a runtime dependency. Career Prep
-- is the same subject matter in a different medium: explanation, practice,
-- checkpoint, XP.
--
-- Concept becomes Topic: the explainer was the same unit as "one thing you
-- learn", so it absorbs the question set and the checkpoint rather than sitting
-- beside a second entity that means the same thing.

-- ── Concept → Topic ─────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.concepts RENAME TO topics;

ALTER POLICY "Public read published concepts" ON public.topics RENAME TO "Public read published topics";
ALTER POLICY "Admins manage concepts"         ON public.topics RENAME TO "Admins manage topics";

-- The Roadmap attachment goes entirely: a Topic is not a Roadmap Step any more.
DROP TABLE IF EXISTS public.concept_steps;

ALTER TABLE IF EXISTS public.concept_questions RENAME TO topic_questions;
ALTER TABLE public.topic_questions RENAME COLUMN concept_id TO topic_id;

ALTER POLICY "Public read concept_questions"  ON public.topic_questions RENAME TO "Public read topic_questions";
ALTER POLICY "Admins manage concept_questions" ON public.topic_questions RENAME TO "Admins manage topic_questions";

-- A Question is either practice for a Topic or the Topic's Checkpoint. One
-- Checkpoint per Topic, enforced rather than assumed — the previous model let
-- extra Checkpoints silently shadow each other.
ALTER TABLE public.topic_questions
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'practice',
  ADD COLUMN IF NOT EXISTS order_index int NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS topic_questions_one_checkpoint_idx
  ON public.topic_questions (topic_id) WHERE role = 'checkpoint';

-- ── Journey stages ──────────────────────────────────────────────────────────
-- A Journey orders Stages; a Stage orders Topics. `roadmap_id` is an optional
-- "read the full roadmap" link, not a dependency — a Stage renders with or
-- without one.
CREATE TABLE IF NOT EXISTS public.journey_stages (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id     uuid NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  title          text NOT NULL,
  description    text,
  duration_weeks int  NOT NULL DEFAULT 4,
  is_assessable  boolean NOT NULL DEFAULT true,
  roadmap_id     uuid REFERENCES public.roadmaps(id) ON DELETE SET NULL,
  order_index    int  NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (journey_id, order_index)
);

CREATE TABLE IF NOT EXISTS public.stage_topics (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id    uuid NOT NULL REFERENCES public.journey_stages(id) ON DELETE CASCADE,
  topic_id    uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  order_index int  NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (stage_id, topic_id)
);

-- Carry the four existing Journeys across so their timelines and end dates
-- survive: each journey_roadmaps row becomes a Stage named after its Roadmap,
-- keeping the link so "read the full roadmap" still works.
INSERT INTO public.journey_stages (journey_id, title, duration_weeks, is_assessable, roadmap_id, order_index)
SELECT jr.journey_id, r.title, jr.duration_weeks, jr.is_assessable, jr.roadmap_id, jr.order_index
FROM public.journey_roadmaps jr
JOIN public.roadmaps r ON r.id = jr.roadmap_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.journey_stages s
  WHERE s.journey_id = jr.journey_id AND s.order_index = jr.order_index
);

-- ── Topic progress ──────────────────────────────────────────────────────────
-- Replaces step_progress as the unit of "done". step_progress is left in place
-- untouched: it holds real learner history, and deleting history to tidy a
-- model is not a trade worth making.
CREATE TABLE IF NOT EXISTS public.topic_progress (
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id   uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  passed_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, topic_id)
);

-- ── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.journey_stages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_topics    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_progress  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read journey_stages" ON public.journey_stages;
CREATE POLICY "Public read journey_stages" ON public.journey_stages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage journey_stages" ON public.journey_stages;
CREATE POLICY "Admins manage journey_stages" ON public.journey_stages FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public read stage_topics" ON public.stage_topics;
CREATE POLICY "Public read stage_topics" ON public.stage_topics FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage stage_topics" ON public.stage_topics;
CREATE POLICY "Admins manage stage_topics" ON public.stage_topics FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Owner-scoped: a learner's progress is theirs.
DROP POLICY IF EXISTS "Learners read own topic_progress" ON public.topic_progress;
CREATE POLICY "Learners read own topic_progress" ON public.topic_progress FOR SELECT
  TO authenticated USING (user_id = auth.uid());

-- ── Checkpoint grading moves onto Topics ────────────────────────────────────
-- Same contract as before: grade in the database, record the attempt, and only
-- then return the correct answer. What changes is what completion means — a
-- Topic, not a Roadmap Step.
CREATE OR REPLACE FUNCTION public.grade_topic_checkpoint(p_question_id uuid, p_topic_id uuid, p_choice text, p_first_try boolean)
RETURNS TABLE(is_correct boolean, correct_option text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_correct text;
  v_ok boolean;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'not signed in'; END IF;

  -- The question must actually be this Topic's Checkpoint, or any question id
  -- could be submitted against any Topic to mark it complete.
  IF NOT EXISTS (
    SELECT 1 FROM public.topic_questions tq
    WHERE tq.topic_id = p_topic_id AND tq.question_id = p_question_id AND tq.role = 'checkpoint'
  ) THEN
    RAISE EXCEPTION 'question is not the checkpoint for this topic';
  END IF;

  SELECT q.correct_option INTO v_correct FROM public.careerprep_questions q WHERE q.id = p_question_id;
  v_ok := (p_choice = v_correct);

  INSERT INTO public.checkpoint_results (user_id, question_id, is_correct, first_try)
  VALUES (v_user, p_question_id, v_ok, coalesce(p_first_try, false));

  IF v_ok THEN
    INSERT INTO public.topic_progress (user_id, topic_id)
    VALUES (v_user, p_topic_id)
    ON CONFLICT (user_id, topic_id) DO NOTHING;
  END IF;

  RETURN QUERY SELECT v_ok, v_correct;
END;
$function$;
