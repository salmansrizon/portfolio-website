-- Add missing columns to blogs table
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS excerpt text DEFAULT NULL;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}';

-- Enable realtime for blogs table
DO $$
BEGIN
  -- Check if blogs is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'blogs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE blogs;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Publication might not exist, ignore error
    NULL;
END $$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
