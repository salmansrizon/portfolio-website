-- Curriculum outline must be publicly browsable (titles, durations, lock state)
-- while content_data (video URLs etc.) stays behind the enrollment-gated RLS on
-- course_content. A postgres-owned view bypasses that RLS and exposes only the
-- safe metadata columns.
create or replace view public.course_content_outline as
select
  id,
  course_id,
  section_id,
  title,
  description,
  content_type,
  content_category,
  is_free,
  order_index,
  duration_minutes,
  topics
from public.course_content;

grant select on public.course_content_outline to anon, authenticated;
