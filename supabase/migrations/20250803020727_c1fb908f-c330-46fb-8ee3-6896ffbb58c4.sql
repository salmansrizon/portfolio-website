-- Add RLS policies for managing course modules, submodules, and content
-- These are required for the admin panel to function properly

-- For course_modules table
CREATE POLICY "Authenticated users can manage course modules" 
ON course_modules 
FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- For course_submodules table  
CREATE POLICY "Authenticated users can manage course submodules"
ON course_submodules
FOR ALL
TO authenticated
USING (true) 
WITH CHECK (true);

-- For course_content table
CREATE POLICY "Authenticated users can manage course content"
ON course_content
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);