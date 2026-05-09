
-- =========================================================
-- Drop legacy permissive "Allow all operations for anon" policies
-- =========================================================
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.blogs;
DROP POLICY IF EXISTS "Authenticated users can manage blogs" ON public.blogs;
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.brand_logos;
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.certifications;
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.course_categories;
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.course_content;
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.course_reviews;
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.courses;
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.instructors;
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.page_views;
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.projects;
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.roadmaps;
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.services;
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.session_bookings;
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.students;
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.testimonials;
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.webinars;
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.career_prep;

-- =========================================================
-- Ensure RLS is enabled
-- =========================================================
ALTER TABLE public.career_prep ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- Public read policies (where missing) + drop overly-broad data-modification policies
-- =========================================================

-- projects: public read, admin manage (admin policy already exists)
DROP POLICY IF EXISTS "Public read projects" ON public.projects;
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (true);

-- testimonials
DROP POLICY IF EXISTS "Public read testimonials" ON public.testimonials;
CREATE POLICY "Public read testimonials" ON public.testimonials FOR SELECT USING (true);

-- certifications
DROP POLICY IF EXISTS "Public read certifications" ON public.certifications;
CREATE POLICY "Public read certifications" ON public.certifications FOR SELECT USING (true);

-- services
DROP POLICY IF EXISTS "Public read services" ON public.services;
CREATE POLICY "Public read services" ON public.services FOR SELECT USING (true);

-- career_prep (legacy table) - public read only, admin manage
DROP POLICY IF EXISTS "Public read career_prep" ON public.career_prep;
DROP POLICY IF EXISTS "Admins manage career_prep" ON public.career_prep;
CREATE POLICY "Public read career_prep" ON public.career_prep FOR SELECT USING (true);
CREATE POLICY "Admins manage career_prep" ON public.career_prep FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- session_bookings: drop broad public SELECT (PII). Keep public INSERT for booking form.
DROP POLICY IF EXISTS "Public view bookings" ON public.session_bookings;

-- course_reviews: keep public insert + public read approved (already exist after drops above)
DROP POLICY IF EXISTS "Public read approved reviews" ON public.course_reviews;
CREATE POLICY "Public read approved reviews" ON public.course_reviews FOR SELECT USING (is_approved = true);
DROP POLICY IF EXISTS "Anyone can submit reviews" ON public.course_reviews;
CREATE POLICY "Anyone can submit reviews" ON public.course_reviews FOR INSERT WITH CHECK (true);
