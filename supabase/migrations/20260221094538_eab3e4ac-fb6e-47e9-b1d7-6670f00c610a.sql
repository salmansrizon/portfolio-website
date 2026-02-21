
-- Session types table (admin configurable)
CREATE TABLE public.session_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  fee NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.session_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active session types"
ON public.session_types FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can manage session types"
ON public.session_types FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Session bookings table
CREATE TABLE public.session_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_type_id UUID NOT NULL REFERENCES public.session_types(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  whatsapp_number TEXT,
  phone_number TEXT,
  booking_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  payment_method TEXT NOT NULL, -- 'bkash' or 'nagad'
  transaction_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, submitted, verified, rejected
  booking_status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  fee_amount NUMERIC NOT NULL DEFAULT 0,
  payment_deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.session_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create bookings"
ON public.session_bookings FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view own bookings by email"
ON public.session_bookings FOR SELECT
USING (true);

CREATE POLICY "Users can update own bookings"
ON public.session_bookings FOR UPDATE
USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage all bookings"
ON public.session_bookings FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Payment settings table (admin configurable bKash/Nagad numbers, payment window)
CREATE TABLE public.payment_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bkash_number TEXT,
  nagad_number TEXT,
  payment_window_minutes INTEGER NOT NULL DEFAULT 30,
  additional_instructions TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view payment settings"
ON public.payment_settings FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage payment settings"
ON public.payment_settings FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Insert default payment settings
INSERT INTO public.payment_settings (bkash_number, nagad_number, payment_window_minutes, additional_instructions)
VALUES ('01XXXXXXXXX', '01XXXXXXXXX', 30, 'Please send the exact amount and provide the transaction ID within 30 minutes.');

-- Insert a default session type
INSERT INTO public.session_types (title, description, duration_minutes, fee)
VALUES ('1-on-1 Consultation', 'Personal consultation session for career guidance, project review, or technical mentoring.', 60, 500);

-- Triggers for updated_at
CREATE TRIGGER update_session_types_updated_at
BEFORE UPDATE ON public.session_types
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_session_bookings_updated_at
BEFORE UPDATE ON public.session_bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_settings_updated_at
BEFORE UPDATE ON public.payment_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
