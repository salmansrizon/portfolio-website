-- Completes the funnel loop: the lead magnet, and the explicit per-Journey
-- mapping that decides which course, webinar and ebook a learner is shown.
--
-- Mapping is explicit rather than tag-matched (§6): with this few courses,
-- hand-mapping takes minutes and is obviously correct, where tag matching is a
-- system to maintain for a problem that does not exist yet.

-- ── Ebooks ──────────────────────────────────────────────────────────────────
-- One flagship plus a table for more. Delivery is email-only (§5): the learner
-- submits an address and the file arrives, because the gate exists to capture a
-- *valid* email and an in-app unlock cannot verify one.
CREATE TABLE IF NOT EXISTS public.ebooks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  title       text NOT NULL,
  description text,
  cover_image text,
  -- Storage path, not a public URL: the delivery page resolves it, so opens are
  -- measurable and the storage target can move to R2/S3 later without touching
  -- anything else.
  storage_path text,
  status      text NOT NULL DEFAULT 'draft',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ebook_unlocks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ebook_id   uuid NOT NULL REFERENCES public.ebooks(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email      text NOT NULL,
  -- Where the unlock was triggered — struggle trigger, completion, sidebar.
  surface    text,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ebook_unlocks_ebook_idx ON public.ebook_unlocks (ebook_id);

ALTER TABLE public.ebooks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ebook_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published ebooks" ON public.ebooks
  FOR SELECT USING (status = 'published');
CREATE POLICY "Admins manage ebooks" ON public.ebooks
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Anyone may request the ebook — that is the whole point of a lead magnet — but
-- nobody may read the resulting list except an admin. The unlock endpoint must
-- be rate-limited per identity and per IP, or it is an open mail relay.
CREATE POLICY "Anyone can request an ebook" ON public.ebook_unlocks
  FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins read ebook unlocks" ON public.ebook_unlocks
  FOR SELECT TO authenticated USING (is_admin());

-- ── Per-Journey offers ──────────────────────────────────────────────────────
ALTER TABLE public.journeys ADD COLUMN IF NOT EXISTS course_id  uuid REFERENCES public.courses(id)  ON DELETE SET NULL;
ALTER TABLE public.journeys ADD COLUMN IF NOT EXISTS webinar_id uuid REFERENCES public.webinars(id) ON DELETE SET NULL;
ALTER TABLE public.journeys ADD COLUMN IF NOT EXISTS ebook_id   uuid REFERENCES public.ebooks(id)   ON DELETE SET NULL;
