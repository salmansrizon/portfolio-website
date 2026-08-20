-- Phase 2 of .scratch/careerprep-edtech/spec.md — the progression model.
--
-- Adds Journeys, Enrolments, Steps progress, Checkpoints, XP and the daily
-- challenge. Nothing here is destructive: only new tables, plus two new columns
-- on `roadmaps`.
--
-- RLS follows §8: learner-owned rows are scoped to auth.uid() (every visitor has
-- one, anonymous or not), published content is world-readable, everything else
-- is admin-only via the existing is_admin().

-- ── Content: Journeys ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.journeys (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  title       text NOT NULL,
  description text,
  -- Matches the single intake question's options exactly, so personalization is
  -- a lookup rather than an algorithm (§6).
  goal        text NOT NULL,
  status      text NOT NULL DEFAULT 'draft',
  order_index int  NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- A Journey is an ordered list of Roadmaps, each with an admin-set duration so
-- the learner sees a realistic end date on day one (§6).
CREATE TABLE IF NOT EXISTS public.journey_roadmaps (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id     uuid NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  roadmap_id     uuid REFERENCES public.roadmaps(id) ON DELETE SET NULL,
  order_index    int  NOT NULL DEFAULT 0,
  duration_weeks int  NOT NULL DEFAULT 2,
  -- Segments the platform cannot assess (§6): reading plus a course hand-off,
  -- marked honestly rather than pretended away.
  is_assessable  boolean NOT NULL DEFAULT true,
  label          text,
  UNIQUE (journey_id, order_index)
);

-- Targeting values the intake maps onto (§6, decision 10 of ticket 03).
ALTER TABLE public.roadmaps ADD COLUMN IF NOT EXISTS goal  text;
ALTER TABLE public.roadmaps ADD COLUMN IF NOT EXISTS level text;

-- ── Learner state ───────────────────────────────────────────────────────────

-- Deliberately NOT `students`, which is the paying-customer record (§7).
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    text UNIQUE,
  display_name text,
  is_public   boolean NOT NULL DEFAULT true,
  -- Streak reads "today or yesterday" against this, default Asia/Dhaka: no DST,
  -- which removes a whole class of bug (§4).
  timezone    text NOT NULL DEFAULT 'Asia/Dhaka',
  target_industry text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- One active Enrolment at a time; switching archives rather than resets, because
-- progress is stored per Step and carries across Journeys (§6).
CREATE TABLE IF NOT EXISTS public.enrolments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id  uuid NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  started_at  timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  UNIQUE (user_id, journey_id)
);

-- Partial unique index: at most one un-archived Enrolment per learner.
CREATE UNIQUE INDEX IF NOT EXISTS enrolments_one_active
  ON public.enrolments (user_id) WHERE archived_at IS NULL;

-- Steps are identified by an author-stable {#slug} in the Roadmap markdown, not
-- by row id (ticket 03). Renaming a slug orphans progress — Roadmap Manager
-- warns and offers a remap.
CREATE TABLE IF NOT EXISTS public.step_progress (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_id uuid NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  step_slug  text NOT NULL,
  passed_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, roadmap_id, step_slug)
);

CREATE TABLE IF NOT EXISTS public.checkpoint_results (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.careerprep_questions(id) ON DELETE CASCADE,
  roadmap_id  uuid REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  step_slug   text,
  is_correct  boolean NOT NULL,
  first_try   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── XP ──────────────────────────────────────────────────────────────────────
-- Ledger, not a counter. Level is always derived from the total against the
-- threshold table, never stored (§4). Streak is derived from submission dates.
CREATE TABLE IF NOT EXISTS public.xp_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount      int  NOT NULL,
  reason      text NOT NULL,
  question_id uuid REFERENCES public.careerprep_questions(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS xp_events_user_idx ON public.xp_events (user_id);

-- Full XP on first solve only, 25% on repeats (§4). One row per user+question
-- makes "first solve" a unique-violation rather than a race.
CREATE UNIQUE INDEX IF NOT EXISTS xp_events_first_solve
  ON public.xp_events (user_id, question_id) WHERE reason = 'first_solve';

-- ── Daily challenge ─────────────────────────────────────────────────────────
-- A pre-shuffled deck, not a hash: hash-mod repeats after ~18 days on a
-- 200-question pool (§4). Global and identical for everyone.
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  for_date    date PRIMARY KEY,
  question_id uuid NOT NULL REFERENCES public.careerprep_questions(id) ON DELETE CASCADE
);

-- ── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.journeys           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_roadmaps   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrolments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.step_progress      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkpoint_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges   ENABLE ROW LEVEL SECURITY;

-- Published content is public; admins manage everything.
CREATE POLICY "Public read published journeys" ON public.journeys
  FOR SELECT USING (status = 'published');
CREATE POLICY "Admins manage journeys" ON public.journeys
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Public read journey_roadmaps" ON public.journey_roadmaps
  FOR SELECT USING (true);
CREATE POLICY "Admins manage journey_roadmaps" ON public.journey_roadmaps
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Public read daily_challenges" ON public.daily_challenges
  FOR SELECT USING (true);
CREATE POLICY "Admins manage daily_challenges" ON public.daily_challenges
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Profiles: public ones are readable by anyone (the profile is an acquisition
-- surface, §9), but a learner only ever writes their own.
CREATE POLICY "Public read public profiles" ON public.profiles
  FOR SELECT USING (is_public OR id = auth.uid());
CREATE POLICY "Learners write own profile" ON public.profiles
  FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Learner-owned rows: owner reads and writes, nobody else.
CREATE POLICY "Learners own enrolments" ON public.enrolments
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Learners own step_progress" ON public.step_progress
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Learners own checkpoint_results" ON public.checkpoint_results
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- XP is READ-ONLY to the client. It is written by the trigger below, so no
-- client-callable XP endpoint exists to abuse (§8).
CREATE POLICY "Learners read own xp" ON public.xp_events
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins manage xp" ON public.xp_events
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ── XP award trigger ────────────────────────────────────────────────────────
-- XP is a pure consequence of a correct submission landing, so it is derived in
-- the database rather than asked for by the client (§8).
CREATE OR REPLACE FUNCTION public.award_xp_for_submission()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  weight int;
BEGIN
  IF NOT NEW.is_correct OR NEW.student_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT CASE lower(coalesce(q.difficulty, 'easy'))
           WHEN 'hard' THEN 50
           WHEN 'medium' THEN 25
           ELSE 10
         END
    INTO weight
    FROM public.careerprep_questions q
   WHERE q.id = NEW.question_id;

  weight := coalesce(weight, 10);

  -- First solve pays full; the partial unique index makes repeats fall through
  -- to the 25% branch without a race.
  BEGIN
    INSERT INTO public.xp_events (user_id, amount, reason, question_id)
    VALUES (NEW.student_id, weight, 'first_solve', NEW.question_id);
  EXCEPTION WHEN unique_violation THEN
    INSERT INTO public.xp_events (user_id, amount, reason, question_id)
    VALUES (NEW.student_id, greatest(1, weight / 4), 'repeat_solve', NEW.question_id);
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS award_xp_on_submission ON public.careerprep_submissions;
CREATE TRIGGER award_xp_on_submission
  AFTER INSERT ON public.careerprep_submissions
  FOR EACH ROW EXECUTE FUNCTION public.award_xp_for_submission();
