-- Add categories column to blogs table
ALTER TABLE blogs 
ADD COLUMN categories TEXT[] DEFAULT '{}';

-- Create an index for the categories array column for better query performance
CREATE INDEX idx_blogs_categories ON blogs USING GIN (categories);
