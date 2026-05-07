-- Ensure uuid_generate_v4 function is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

create table projects (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  technologies text[] not null,
  image_url text,
  demo_url text,
  github_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view projects" 
ON public.projects 
FOR SELECT 
USING (true);

-- Create admin policy
CREATE POLICY "Authenticated users can manage projects" 
ON public.projects 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial projects
INSERT INTO public.projects (title, description, technologies, image_url, demo_url, github_url) VALUES
(
  'Enterprise BI Dashboard Suite',
  'A comprehensive business intelligence solution built for a Fortune 500 company. Features include real-time KPI tracking, automated reporting, and predictive analytics capabilities.',
  ARRAY['Power BI', 'Azure Synapse', 'SQL Server', 'Python', 'DAX'],
  'https://example.com/images/bi-dashboard.png',
  'https://demo.example.com/bi-dashboard',
  'https://github.com/example/bi-dashboard'
),
(
  'Data Pipeline Automation System',
  'Automated ETL pipeline system that processes terabytes of data daily. Implemented smart error handling and monitoring with 99.9% uptime.',
  ARRAY['Azure Data Factory', 'Apache Spark', 'Python', 'Azure Functions', 'Docker'],
  'https://example.com/images/data-pipeline.png',
  'https://demo.example.com/data-pipeline',
  'https://github.com/example/data-pipeline'
),
(
  'Real-time Analytics Platform',
  'Real-time analytics solution for e-commerce data. Processes millions of events per day with sub-second latency.',
  ARRAY['Azure Stream Analytics', 'Event Hubs', 'Power BI', 'Kafka', 'Redis'],
  'https://example.com/images/realtime-analytics.png',
  'https://demo.example.com/realtime-analytics',
  'https://github.com/example/realtime-analytics'
),
(
  'Machine Learning Operations Platform',
  'End-to-end MLOps platform for automating model training, deployment, and monitoring. Reduced model deployment time from weeks to hours.',
  ARRAY['Azure ML', 'Python', 'TensorFlow', 'Docker', 'Kubernetes'],
  'https://example.com/images/mlops.png',
  'https://demo.example.com/mlops',
  'https://github.com/example/mlops'
);