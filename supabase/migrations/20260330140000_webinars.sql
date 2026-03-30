-- Webinar Management Schema

CREATE TABLE IF NOT EXISTS webinars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    webinar_date TIMESTAMPTZ NOT NULL,
    price NUMERIC DEFAULT 0,
    is_free BOOLEAN DEFAULT true,
    banner_url TEXT,
    content_blocks JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webinar_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webinar_id UUID REFERENCES webinars(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    student_whatsapp TEXT NOT NULL,
    payment_status TEXT DEFAULT 'free', -- free, pending, confirmed
    payment_transaction_id TEXT,
    booking_date TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE webinar_bookings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access to published webinars" ON webinars FOR SELECT USING (status = 'published');
CREATE POLICY "Allow public insert to webinar_bookings" ON webinar_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin manage webinars" ON webinars FOR ALL USING (true); -- Simplified for local dev
CREATE POLICY "Allow admin manage bookings" ON webinar_bookings FOR ALL USING (true); -- Simplified for local dev
