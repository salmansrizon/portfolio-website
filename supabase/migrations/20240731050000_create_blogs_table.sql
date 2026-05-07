-- 20240731050000_create_blogs_table.sql
-- This migration creates the `blogs` table which is required by later migrations
-- (e.g., 20240731051629_add_categories_to_blogs.sql). It must run before any
-- ALTER statements that reference the table.

CREATE TABLE IF NOT EXISTS public.blogs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    content text,
    author_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Optional index for ordering
CREATE INDEX IF NOT EXISTS blogs_created_at_idx ON public.blogs (created_at);
