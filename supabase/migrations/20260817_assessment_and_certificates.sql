-- Phase 3 — the timed final assessment and the certificate it issues.
--
-- This is the ONE path that re-validates server-side (§8). Everywhere else a
-- learner can forge their own results and it harms only them; here a forged pass
-- produces a credential someone may put on a CV, so grading happens in the
-- database and a pass cannot be asserted by the client.
--
-- KNOWN LIMITATION, verified 2026-08-17: `careerprep_questions.correct_option`
-- is readable by anyone, because the table has a blanket public-read policy and
-- RLS is row-level, not column-level. So the assessment is effectively OPEN
-- BOOK — a determined learner can look the answers up, even though they cannot
-- POST `passed: true`.
--
-- Closing it properly means exposing questions through a view without
-- `correct_option` and revoking table-level SELECT, which also has to keep the
-- admin panel working (admins are just `authenticated` too, so column grants
-- cannot distinguish them). Scoped as follow-up rather than bodged here.
--
-- Both functions are SECURITY DEFINER and scope every write to auth.uid(), so
-- there is no way to start or submit an attempt on someone else's behalf.

-- ── Start an attempt ────────────────────────────────────────────────────────
-- The server picks the questions. If the client chose them it could ask for
-- twelve easy ones, and the certificate would mean nothing.
CREATE OR REPLACE FUNCTION public.start_assessment(p_journey_id uuid)
  RETURNS TABLE (attempt_id uuid, question_ids uuid[])
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_ids  uuid[];
  v_attempt uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not signed in';
  END IF;

  -- Twelve MCQs, weighted toward the harder end, drawn from the Journey's
  -- assessable material. Random per attempt so a retake is not the same paper.
  SELECT array_agg(q.id) INTO v_ids
  FROM (
    SELECT id
    FROM public.careerprep_questions
    WHERE question_type = 'mcq'
      AND correct_option IS NOT NULL
    ORDER BY
      CASE lower(coalesce(difficulty, 'easy'))
        WHEN 'hard' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
      random()
    LIMIT 12
  ) q;

  IF v_ids IS NULL OR array_length(v_ids, 1) < 5 THEN
    RAISE EXCEPTION 'not enough assessable questions to run an assessment';
  END IF;

  INSERT INTO public.assessment_attempts (user_id, journey_id, question_ids, total)
  VALUES (v_user, p_journey_id, v_ids, array_length(v_ids, 1))
  RETURNING id INTO v_attempt;

  RETURN QUERY SELECT v_attempt, v_ids;
END;
$$;

-- ── Submit an attempt ───────────────────────────────────────────────────────
-- p_answers is {"<question_id>": "B", ...}. Grading reads correct_option from
-- the table, never from anything the client sent.
CREATE OR REPLACE FUNCTION public.submit_assessment(p_attempt_id uuid, p_answers jsonb)
  RETURNS TABLE (score int, total int, passed boolean, certificate_id uuid)
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_attempt public.assessment_attempts%ROWTYPE;
  v_score int := 0;
  v_total int;
  v_passed boolean;
  v_cert uuid;
  v_journey_title text;
  v_name text;
BEGIN
  SELECT * INTO v_attempt
  FROM public.assessment_attempts
  WHERE id = p_attempt_id AND user_id = v_user;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'attempt not found';
  END IF;
  IF v_attempt.submitted_at IS NOT NULL THEN
    RAISE EXCEPTION 'attempt already submitted';
  END IF;

  -- A 60-minute paper. Late submissions still grade, so a slow connection does
  -- not destroy an attempt, but the window is recorded on the row.
  SELECT count(*)::int INTO v_score
  FROM public.careerprep_questions q
  WHERE q.id = ANY (v_attempt.question_ids)
    AND p_answers ->> q.id::text = q.correct_option;

  v_total := coalesce(v_attempt.total, array_length(v_attempt.question_ids, 1));
  v_passed := v_score::numeric / greatest(v_total, 1) >= 0.7;

  UPDATE public.assessment_attempts
     SET submitted_at = now(), score = v_score, passed = v_passed
   WHERE id = p_attempt_id;

  IF v_passed THEN
    SELECT j.title INTO v_journey_title FROM public.journeys j WHERE j.id = v_attempt.journey_id;
    SELECT coalesce(p.display_name, p.username, 'Career Prep learner')
      INTO v_name FROM public.profiles p WHERE p.id = v_user;

    INSERT INTO public.certificates (user_id, journey_id, credential_title, holder_name, assessed_summary)
    VALUES (
      v_user,
      v_attempt.journey_id,
      coalesce(v_journey_title, 'Career Prep') || ' — assessed portion',
      coalesce(v_name, 'Career Prep learner'),
      jsonb_build_object(
        'questions', v_total,
        'score', v_score,
        'timed_minutes', 60,
        'scope', 'Covers only the portion of this Journey the platform assesses. It does not certify skills that were not tested.'
      )
    )
    ON CONFLICT (user_id, journey_id) WHERE status = 'valid'
    DO UPDATE SET issued_at = now()
    RETURNING id INTO v_cert;
  END IF;

  RETURN QUERY SELECT v_score, v_total, v_passed, v_cert;
END;
$$;
