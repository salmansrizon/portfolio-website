-- Add gamification to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS xp INT DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS streak INT DEFAULT 0;

-- Create questions table
CREATE TABLE IF NOT EXISTS careerprep_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  industry TEXT NOT NULL,
  content_md TEXT NOT NULL,
  schema_sql TEXT NOT NULL,
  initial_sql TEXT NOT NULL,
  solution_sql TEXT NOT NULL,
  success_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS careerprep_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  question_id UUID REFERENCES careerprep_questions(id) ON DELETE CASCADE,
  submitted_code TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  execution_time FLOAT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE careerprep_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE careerprep_submissions ENABLE ROW LEVEL SECURITY;

-- Policies for careerprep_questions
CREATE POLICY "Allow public read access to careerprep_questions" ON careerprep_questions FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage careerprep_questions" ON careerprep_questions FOR ALL USING (auth.role() = 'authenticated');

-- Policies for careerprep_submissions
-- In a real app we'd verify the user mapping, but here we allow insert for demo purposes
CREATE POLICY "Allow public insert to careerprep_submissions" ON careerprep_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public to view submissions" ON careerprep_submissions FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage careerprep_submissions" ON careerprep_submissions FOR ALL USING (auth.role() = 'authenticated');
