-- Create table for managing unavailable booking slots
CREATE TABLE public.unavailable_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  time_slot TEXT, -- NULL means entire day is unavailable
  reason TEXT, -- Optional reason for unavailability
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.unavailable_slots ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Anyone can view unavailable slots" 
ON public.unavailable_slots 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage unavailable slots" 
ON public.unavailable_slots 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_unavailable_slots_updated_at
BEFORE UPDATE ON public.unavailable_slots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_unavailable_slots_date ON public.unavailable_slots(date);
CREATE INDEX idx_unavailable_slots_date_time ON public.unavailable_slots(date, time_slot);