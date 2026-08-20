-- careerprep_submissions.student_id pointed at `students` — the paying-customer
-- record — while the app has always written the *auth* user id into it. The two
-- never matched (0 of 1 student rows corresponds to an auth.users row), so every
-- insert was rejected by the foreign key. `logSubmission` only console.errors,
-- so this failed silently: the table has never held a single row, and no
-- learner's progress has ever persisted.
--
-- Repointing at auth.users is what the rest of the model already assumes:
-- step_progress, checkpoint_results, xp_events and enrolments all key on
-- auth.users, and §7 of the spec is explicit that `students` (a purchaser) and a
-- learner are different things.
--
-- Safe to run: the table is empty, so there is nothing to migrate or orphan.

ALTER TABLE public.careerprep_submissions
  DROP CONSTRAINT IF EXISTS careerprep_submissions_student_id_fkey;

ALTER TABLE public.careerprep_submissions
  ADD CONSTRAINT careerprep_submissions_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;
