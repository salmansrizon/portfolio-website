-- Drop the broken policy that uses auth.email()
DROP POLICY IF EXISTS "Admin full access to enrollments" ON public.course_enrollments;

-- Use auth.jwt() ->> 'email' which reads strictly from the JWT token and doesn't trigger table lookups
CREATE POLICY "Admin full access to enrollments" 
ON public.course_enrollments 
FOR ALL 
TO authenticated
USING (
  (auth.jwt()->>'email') IN (
    'admin@example.com',
    'salmansrizon2016@gmail.com'
  )
)
WITH CHECK (
  (auth.jwt()->>'email') IN (
    'admin@example.com',
    'salmansrizon2016@gmail.com'
  )
);
