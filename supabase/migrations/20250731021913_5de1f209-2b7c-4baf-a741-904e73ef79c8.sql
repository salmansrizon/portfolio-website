-- Add new fields to course_enrollments table
ALTER TABLE course_enrollments 
ADD COLUMN whatsapp_number text,
ADD COLUMN profession text,
ADD COLUMN institute_name text;

-- Add rating and student_count to courses table
ALTER TABLE courses 
ADD COLUMN rating numeric(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
ADD COLUMN student_count integer DEFAULT 0 CHECK (student_count >= 0);