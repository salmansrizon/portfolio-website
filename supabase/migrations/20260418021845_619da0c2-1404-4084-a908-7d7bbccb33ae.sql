-- Create public storage bucket for roadmap icons
INSERT INTO storage.buckets (id, name, public)
VALUES ('roadmap-icons', 'roadmap-icons', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Public read roadmap icons"
ON storage.objects FOR SELECT
USING (bucket_id = 'roadmap-icons');

-- Authenticated users (admins) can upload
CREATE POLICY "Authenticated upload roadmap icons"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'roadmap-icons');

-- Authenticated users (admins) can update
CREATE POLICY "Authenticated update roadmap icons"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'roadmap-icons');

-- Authenticated users (admins) can delete
CREATE POLICY "Authenticated delete roadmap icons"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'roadmap-icons');