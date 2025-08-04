-- Add discount fields to courses table
ALTER TABLE courses 
ADD COLUMN discounted_price NUMERIC,
ADD COLUMN discount_percentage INTEGER;

-- Drop unused module and submodule tables
DROP TABLE IF EXISTS course_modules CASCADE;
DROP TABLE IF EXISTS course_submodules CASCADE;
DROP TABLE IF EXISTS course_lessons CASCADE;
DROP TABLE IF EXISTS lesson_resources CASCADE;
DROP TABLE IF EXISTS user_lesson_progress CASCADE;

-- Drop related functions and triggers
DROP FUNCTION IF EXISTS calculate_module_duration(uuid) CASCADE;
DROP FUNCTION IF EXISTS update_module_duration() CASCADE;
DROP FUNCTION IF EXISTS get_course_progress(uuid, uuid) CASCADE;