import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { track } from '@/services/funnel';

// Journeys, Enrolments and the plan. See §6 of the careerprep-edtech spec.
//
// Every query here fails soft: the progression tables arrive in
// `20260817_phase2_progression_model.sql`, and no Journey is seeded yet, so
// until both happen these return empty and the lobby simply renders without a
// Journey rather than erroring.

export interface Journey {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  goal: string;
}

// A Stage is a phase of a Journey: a title, a duration, and its ordered Topics.
// `roadmap` is an optional "read the full map" link, not a dependency — a Stage
// renders fine without one (docs/adr/0004).
export interface JourneyStage {
  id: string;
  journey_id: string;
  title: string;
  description: string | null;
  roadmap_id: string | null;
  order_index: number;
  duration_weeks: number;
  is_assessable: boolean;
  roadmap?: { id: string; title: string; slug: string; status: string } | null;
  topics: { id: string; slug: string; title: string; order_index: number }[];
}

export interface Enrolment {
  id: string;
  journey_id: string;
  started_at: string;
  archived_at: string | null;
}

export function useJourneys() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['journeys'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('journeys')
        .select('id, slug, title, description, goal')
        .eq('status', 'published')
        .order('order_index');
      if (error) return [] as Journey[];
      return (data ?? []) as Journey[];
    },
  });
  return { journeys: data, loading: isLoading };
}

/** The learner's one un-archived Enrolment, if any. */
export function useActiveEnrolment() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['enrolment', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('enrolments')
        .select('id, journey_id, started_at, archived_at')
        .eq('user_id', userId)
        .is('archived_at', null)
        .maybeSingle();
      if (error) return null;
      return (data ?? null) as Enrolment | null;
    },
  });

  return { enrolment: data ?? null, loading: isLoading };
}

/** The ordered Stages making up a Journey, each with its Topics. */
export function useJourneyPlan(journeyId?: string) {
  const { data = [], isLoading } = useQuery({
    queryKey: ['journey-plan', journeyId],
    enabled: !!journeyId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('journey_stages')
        .select(`id, journey_id, title, description, roadmap_id, order_index, duration_weeks, is_assessable,
                 roadmap:roadmaps(id, title, slug, status),
                 stage_topics(order_index, topic:topics(id, slug, title))`)
        .eq('journey_id', journeyId)
        .order('order_index');
      if (error) return [] as JourneyStage[];

      return ((data ?? []) as any[]).map((stage) => ({
        ...stage,
        // A draft Topic is filtered out by RLS, which leaves the join row with a
        // null topic rather than dropping it.
        topics: (stage.stage_topics ?? [])
          .filter((st: any) => st.topic)
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((st: any) => ({ ...st.topic, order_index: st.order_index })),
      })) as JourneyStage[];
    },
  });
  return { plan: data, loading: isLoading };
}

export function useEnrol() {
  const { session } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (journeyId: string) => {
      const userId = session?.user?.id;
      if (!userId) throw new Error('No session — anonymous sign-in may have failed.');

      // One active Enrolment at a time; a previous one is archived, never
      // deleted, because Step progress is stored separately and carries across.
      await (supabase as any)
        .from('enrolments')
        .update({ archived_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('archived_at', null);

      const { error } = await (supabase as any)
        .from('enrolments')
        .upsert(
          { user_id: userId, journey_id: journeyId, archived_at: null },
          { onConflict: 'user_id,journey_id' },
        );
      if (error) throw error;
    },
    onSuccess: (_d, journeyId) => {
      qc.invalidateQueries({ queryKey: ['enrolment'] });
      void track({ event: 'committed', surface: 'lobby', subjectType: 'journey', subjectId: journeyId, journeyId });
    },
  });
}

/**
 * Elapsed position in the plan. Shows "Week 3 of 16" — elapsed progress, never
 * lateness (§6): falling behind reschedules silently rather than accusing
 * anyone, because guilt mechanics are what the harm evidence implicates.
 */
export function journeyPosition(plan: JourneyStage[], startedAt?: string) {
  const totalWeeks = plan.reduce((n, r) => n + (r.duration_weeks ?? 0), 0);
  if (!startedAt || totalWeeks === 0) return { week: 1, totalWeeks };
  const elapsedMs = Date.now() - new Date(startedAt).getTime();
  const elapsedWeeks = Math.floor(elapsedMs / (7 * 24 * 3600 * 1000)) + 1;
  return { week: Math.min(elapsedWeeks, totalWeeks), totalWeeks };
}
