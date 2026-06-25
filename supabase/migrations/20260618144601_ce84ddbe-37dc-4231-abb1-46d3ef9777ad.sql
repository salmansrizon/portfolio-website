ALTER TABLE public.portfolio_sections
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS section_type text NOT NULL DEFAULT 'predefined',
  ADD COLUMN IF NOT EXISTS custom_fields jsonb,
  ADD COLUMN IF NOT EXISTS order_index integer NOT NULL DEFAULT 0;

-- Attach DB webhook trigger so new enrollments/bookings notify the telegram-bot edge function
DROP TRIGGER IF EXISTS notify_telegram_on_enrollment ON public.course_enrollments;
CREATE TRIGGER notify_telegram_on_enrollment
AFTER INSERT ON public.course_enrollments
FOR EACH ROW EXECUTE FUNCTION public.notify_telegram_bot();

DROP TRIGGER IF EXISTS notify_telegram_on_booking ON public.session_bookings;
CREATE TRIGGER notify_telegram_on_booking
AFTER INSERT ON public.session_bookings
FOR EACH ROW EXECUTE FUNCTION public.notify_telegram_bot();