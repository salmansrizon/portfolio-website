-- Fix critical security vulnerability in course_enrollments table
-- Remove overly permissive RLS policy that allows anyone to view all enrollment data

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view enrollments" ON public.course_enrollments;

-- Create secure policies that protect student data
-- Policy 1: Users can only view their own enrollment data (based on email)
CREATE POLICY "Users can view own enrollments" 
ON public.course_enrollments 
FOR SELECT 
TO authenticated
USING (auth.jwt() ->> 'email' = user_email);

-- Policy 2: Allow public course enrollment (INSERT only) 
CREATE POLICY "Public can enroll in courses" 
ON public.course_enrollments 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Policy 3: Authenticated users can update their own enrollment progress
CREATE POLICY "Users can update own enrollment progress" 
ON public.course_enrollments 
FOR UPDATE 
TO authenticated
USING (auth.jwt() ->> 'email' = user_email)
WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- Policy 4: Remove the overly broad "Authenticated users can manage enrollments" policy
-- and replace it with admin-only access for full management
DROP POLICY IF EXISTS "Authenticated users can manage enrollments" ON public.course_enrollments;

-- Policy 5: Admin full access using auth.email() (avoids querying auth.users which is restricted)
CREATE POLICY "Admin full access to enrollments" 
ON public.course_enrollments 
FOR ALL 
TO authenticated
USING (
  auth.email() IN (
    'admin@example.com',
    'salmansrizon2016@gmail.com'
  )
)
WITH CHECK (
  auth.email() IN (
    'admin@example.com',
    'salmansrizon2016@gmail.com'
  )
);