-- Closes the two remaining data-exposure holes found by the 2026-08-17 policy
-- audit (§13 of .scratch/careerprep-edtech/spec.md).
--
-- PREREQUISITE, already satisfied: Supabase anonymous sign-in is enabled, and
-- the app signs every visitor in anonymously on first load (AuthContext). Until
-- both were true these tables HAD to be world-readable, because a guest had no
-- auth.uid() for a policy to scope against. Do not apply this against an
-- environment where anonymous sign-in is off — guest progress will silently
-- stop working.

-- ── careerprep_guests ───────────────────────────────────────────────────────
-- Held email + whatsapp for every captured lead behind `qual=true`, so the
-- entire lead list was readable by anyone holding the anon key that ships in
-- the client bundle. Nothing public reads this table: the only reader is the
-- admin screen, which is already covered by "Admins manage careerprep_guests".
DROP POLICY IF EXISTS "Public select careerprep_guests" ON public.careerprep_guests;

-- The public INSERT and UPDATE policies stay: the guest capture form uses
-- upsert(onConflict: 'email'), which needs both. UPDATE remains permissive,
-- so a row can still be overwritten by anyone who guesses its email — an
-- integrity weakness, not a leak. Fixing it properly means keying guests on
-- auth.uid() rather than email, which is a schema change, not a policy change.

-- ── careerprep_submissions ──────────────────────────────────────────────────
-- Every learner's raw SQL was readable by anyone. The Phase 0 client fix stopped
-- the app *displaying* other people's attempts; this stops the API *serving*
-- them.
DROP POLICY IF EXISTS "Public view careerprep_submissions" ON public.careerprep_submissions;

CREATE POLICY "Learners read own submissions"
  ON public.careerprep_submissions
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Submissions stay client-asserted — validation runs in the browser under
-- PGLite, so a learner can always claim a pass they did not earn. That is
-- accepted (§8: it harms only the forger). What this prevents is attributing a
-- submission to a *different* user.
--
-- Cost, stated plainly: if anonymous sign-in ever fails, student_id is null and
-- the insert is rejected, so the attempt goes unrecorded rather than being
-- stored unattributed.
DROP POLICY IF EXISTS "Public insert careerprep_submissions" ON public.careerprep_submissions;

CREATE POLICY "Learners insert own submissions"
  ON public.careerprep_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());
