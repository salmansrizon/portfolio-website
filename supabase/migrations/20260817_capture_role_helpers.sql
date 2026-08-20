-- Captures the two role-helper functions that RLS policies across this schema
-- depend on. Both already exist in the live database but were created through
-- the dashboard, so no migration described them — meaning a rebuild from
-- migrations alone would produce a schema whose policies reference functions
-- that do not exist.
--
-- Transcribed verbatim from `pg_get_functiondef` on 2026-08-17. CREATE OR
-- REPLACE is idempotent and the bodies match live exactly, so applying this
-- against the current database is a no-op.
--
-- Phase 0, item 6 of .scratch/careerprep-edtech/spec.md

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
  RETURNS boolean
  LANGUAGE sql
  STABLE SECURITY DEFINER
  SET search_path TO 'public'
AS $function$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $function$;

CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE SECURITY DEFINER
  SET search_path TO 'public'
AS $function$ SELECT public.has_role(auth.uid(),'admin') $function$;
