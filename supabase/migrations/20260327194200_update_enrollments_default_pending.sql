-- Update course_enrollments status to include 'pending' and set it as default
DO $$ 
BEGIN
    ALTER TABLE public.course_enrollments DROP CONSTRAINT IF EXISTS course_enrollments_status_check;
    ALTER TABLE public.course_enrollments ADD CONSTRAINT course_enrollments_status_check CHECK (status IN ('active', 'completed', 'cancelled', 'pending', 'rejected'));
    ALTER TABLE public.course_enrollments ALTER COLUMN status SET DEFAULT 'pending';
END $$;
