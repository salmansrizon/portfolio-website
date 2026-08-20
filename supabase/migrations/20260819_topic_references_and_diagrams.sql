-- Two additions to a Topic: where to go next, and something to look at.
--
-- References are external and deliberately mostly free — primary documentation
-- and the courses that are genuinely open. A reading list of paywalls reads as
-- an affiliate page, and the Topic's own paid course is already one section
-- below.
CREATE TABLE IF NOT EXISTS public.topic_references (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id    uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  label       text NOT NULL,
  url         text NOT NULL,
  -- doc | course | practice | article | video — drives the icon and grouping.
  kind        text NOT NULL DEFAULT 'doc',
  -- Why this link and not the fifty others. A bare list of URLs is a bookmark
  -- dump; one line of "read this for X" is what makes it a reading list.
  note        text,
  is_free     boolean NOT NULL DEFAULT true,
  order_index int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (topic_id, url)
);

CREATE INDEX IF NOT EXISTS topic_references_topic_idx ON public.topic_references (topic_id, order_index);

ALTER TABLE public.topic_references ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read topic_references" ON public.topic_references;
CREATE POLICY "Public read topic_references" ON public.topic_references FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage topic_references" ON public.topic_references;
CREATE POLICY "Admins manage topic_references" ON public.topic_references FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- A diagram on a sub-topic card. Stored as a tiny declarative string rather
-- than an image so it stays searchable, themable, translatable and diffable —
-- and so nobody has to open a design tool to fix a typo.
--
--   flow: Ingest > Chunk > Embed > Index
--   compare: Batch | Streaming
--   stack: Raw / Staged / Marts
ALTER TABLE public.topic_sections
  ADD COLUMN IF NOT EXISTS diagram text;
