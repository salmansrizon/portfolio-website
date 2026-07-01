-- Promo codes for course/webinar enrollment discounts
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  discount_type text NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  scope text NOT NULL DEFAULT 'all' CHECK (scope IN ('all', 'course', 'webinar')),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  webinar_id uuid REFERENCES public.webinars(id) ON DELETE CASCADE,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Public can look up active, currently-valid codes (needed for client-side promo validation).
-- max_uses is intentionally not checked here so the client can distinguish
-- an unknown code from one that has hit its usage limit.
DROP POLICY IF EXISTS "Public read active promo codes" ON public.promo_codes;
CREATE POLICY "Public read active promo codes" ON public.promo_codes
  FOR SELECT USING (
    is_active = true
    AND valid_from <= now()
    AND (valid_until IS NULL OR valid_until >= now())
  );

DROP POLICY IF EXISTS "Admins manage promo codes" ON public.promo_codes;
CREATE POLICY "Admins manage promo codes" ON public.promo_codes
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

GRANT SELECT ON public.promo_codes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_codes TO authenticated;
GRANT ALL ON public.promo_codes TO service_role;

-- Lets the checkout flow bump used_count without granting anon a general UPDATE policy.
CREATE OR REPLACE FUNCTION public.increment_promo_code_usage(code_input text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.promo_codes SET used_count = used_count + 1 WHERE code = upper(code_input);
$$;

GRANT EXECUTE ON FUNCTION public.increment_promo_code_usage(text) TO anon, authenticated;

-- Record which promo code (if any) was applied to an enrollment/booking
ALTER TABLE public.course_enrollments ADD COLUMN IF NOT EXISTS promo_code text;
ALTER TABLE public.course_enrollments ADD COLUMN IF NOT EXISTS discount_amount numeric;

ALTER TABLE public.webinar_bookings ADD COLUMN IF NOT EXISTS promo_code text;
ALTER TABLE public.webinar_bookings ADD COLUMN IF NOT EXISTS discount_amount numeric;

NOTIFY pgrst, 'reload schema';
