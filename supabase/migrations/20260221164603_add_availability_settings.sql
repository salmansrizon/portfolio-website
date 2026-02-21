-- Create the availability_settings table
CREATE TABLE public.availability_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    available_weekdays INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5}', -- 0=Sun, 1=Mon, ..., 6=Sat
    time_slots TEXT[] NOT NULL DEFAULT '{09:00,09:30,10:00,10:30,11:00,11:30,12:00,12:30,13:00,13:30,14:00,14:30,15:00,15:30,16:00,16:30,17:00,17:30}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.availability_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Enable read access for all users" ON public.availability_settings
    FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Enable full access for authenticated users" ON public.availability_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert a default row
INSERT INTO public.availability_settings (id) VALUES (gen_random_uuid());
