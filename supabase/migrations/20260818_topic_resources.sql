-- Extended learning hangs off the Topic, not off the Journey.
--
-- A Journey-level offer is the right shape for "here is the course for this
-- career". It is the wrong shape for "you just read about rerankers and want
-- more on rerankers" — which is the moment a learner is most likely to buy, and
-- the moment a generic course link is most obviously an advert.
--
-- Free material teaches the Topic; the paid micro-course is the further reading
-- for that same Topic, and the study material is what they take away.

ALTER TABLE public.topics
  ADD COLUMN IF NOT EXISTS course_id  uuid REFERENCES public.courses(id)  ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS ebook_id   uuid REFERENCES public.ebooks(id)   ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS webinar_id uuid REFERENCES public.webinars(id) ON DELETE SET NULL;
