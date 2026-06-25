GRANT SELECT, INSERT ON public.session_bookings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_bookings TO authenticated;
GRANT ALL ON public.session_bookings TO service_role;

GRANT SELECT, INSERT ON public.course_enrollments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_enrollments TO authenticated;
GRANT ALL ON public.course_enrollments TO service_role;

GRANT SELECT, INSERT ON public.course_reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_reviews TO authenticated;
GRANT ALL ON public.course_reviews TO service_role;

GRANT SELECT, INSERT ON public.page_views TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;

GRANT SELECT, INSERT ON public.careerprep_guests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.careerprep_guests TO authenticated;
GRANT ALL ON public.careerprep_guests TO service_role;

GRANT SELECT, INSERT ON public.careerprep_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.careerprep_submissions TO authenticated;
GRANT ALL ON public.careerprep_submissions TO service_role;

GRANT SELECT, INSERT ON public.webinar_bookings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webinar_bookings TO authenticated;
GRANT ALL ON public.webinar_bookings TO service_role;