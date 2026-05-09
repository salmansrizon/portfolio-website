
-- Ensure updated_at function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Recreate updated_at triggers (idempotent)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT c.table_name
    FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.column_name='updated_at'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', r.table_name, r.table_name);
    EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', r.table_name, r.table_name);
  END LOOP;
END $$;

-- Telegram notification trigger
CREATE OR REPLACE FUNCTION public.notify_telegram_bot()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  payload jsonb;
  fn_url text := 'https://llmeentlxjauihrkkrjg.supabase.co/functions/v1/telegram-bot';
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbWVlbnRseGphdWlocmtrcmpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNzg1NTMsImV4cCI6MjA2ODc1NDU1M30.xOrWNt9jkPhI11CFkkFTgFjuH8SNbIjp4oyk3e34vt8';
BEGIN
  payload := jsonb_build_object('table', TG_TABLE_NAME, 'record', to_jsonb(NEW));
  PERFORM net.http_post(
    url := fn_url,
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||anon_key),
    body := payload
  );
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS notify_tg_on_enrollment ON public.course_enrollments;
CREATE TRIGGER notify_tg_on_enrollment
  AFTER INSERT ON public.course_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.notify_telegram_bot();

DROP TRIGGER IF EXISTS notify_tg_on_booking ON public.session_bookings;
CREATE TRIGGER notify_tg_on_booking
  AFTER INSERT ON public.session_bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_telegram_bot();
