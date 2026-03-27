-- Drop old SELECT policies
DROP POLICY IF EXISTS "Allow public read approved reviews" ON course_reviews;
DROP POLICY IF EXISTS "Allow public read all reviews" ON course_reviews;

-- Public users can only read approved reviews
CREATE POLICY "Allow public read approved reviews" ON course_reviews 
  FOR SELECT 
  USING (is_approved = true);

-- Authenticated users (admin) can read ALL reviews
CREATE POLICY "Allow authenticated read all reviews" ON course_reviews 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Ensure authenticated users can update reviews (approve/reject)
DROP POLICY IF EXISTS "Allow authenticated to manage reviews" ON course_reviews;
CREATE POLICY "Allow authenticated to manage reviews" ON course_reviews 
  FOR ALL 
  USING (auth.role() = 'authenticated');
