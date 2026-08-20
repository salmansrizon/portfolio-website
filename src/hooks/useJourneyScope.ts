import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { challengeDate } from './useDailyChallenge';

// Once a learner picks a Journey, the whole surface belongs to that Journey.
// Practice, the daily challenge and the next-up queue all draw from the same
// pool: the Questions attached to the Topics in that Journey's Stages.
//
// An AI Engineering learner being handed a window-functions drill is not a
// gentle nudge toward breadth — it reads as the product not knowing what they
// chose, and it is the fastest way to make a plan feel like a list.

export interface PoolQuestion {
  id: string;
  slug: string;
  title: string;
  difficulty: string | null;
  industry: string | null;
  question_type: string;
}

/** Every Question a Journey covers, through its Stages and Topics. */
export function useJourneyQuestionPool(journeyId?: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['journey-pool', journeyId],
    enabled: !!journeyId,
    // The pool changes only when an admin edits the plan.
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data: stages } = await (supabase as any)
        .from('journey_stages')
        .select('stage_topics(topic_id)')
        .eq('journey_id', journeyId);

      const topicIds = ((stages ?? []) as any[])
        .flatMap((s) => s.stage_topics ?? [])
        .map((st: any) => st.topic_id);
      if (topicIds.length === 0) return [] as PoolQuestion[];

      // Checkpoints are excluded: they close a Topic and are answered there, so
      // offering one as "practice" would spend the assessment before the lesson.
      const { data: rows } = await (supabase as any)
        .from('topic_questions')
        .select('role, question:careerprep_questions(id, slug, title, difficulty, industry, question_type)')
        .in('topic_id', topicIds)
        .in('role', ['practice', 'case_study']);

      const seen = new Set<string>();
      const pool: PoolQuestion[] = [];
      for (const row of (rows ?? []) as any[]) {
        // One Question can serve several Topics in the same plan — count it once.
        if (!row.question || seen.has(row.question.id)) continue;
        seen.add(row.question.id);
        pool.push(row.question as PoolQuestion);
      }
      return pool;
    },
  });

  return { pool: data ?? [], loading: isLoading };
}

/** Stable per (date, journey): everyone on the same plan gets the same one. */
function pickForDate(pool: PoolQuestion[], date: string): PoolQuestion | null {
  if (pool.length === 0) return null;
  // Sorting by id makes the sequence independent of row order coming back.
  const ordered = [...pool].sort((a, b) => a.id.localeCompare(b.id));
  let hash = 0;
  for (const ch of date) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return ordered[hash % ordered.length];
}

/**
 * The daily challenge, scoped to the learner's Journey.
 *
 * The global deck in `daily_challenges` still serves anyone not enrolled. Once
 * enrolled, the question comes from their own plan instead — the same for
 * everyone on that plan, on that date, so it stays discussable.
 *
 * Honest limit: a hash over a journey-sized pool repeats sooner than the 180-day
 * global deck does. With ~50 questions in a plan that is a repeat every ~50
 * days, and a repeat of something relevant beats a fresh irrelevance.
 */
export function useJourneyDailyChallenge(journeyId?: string) {
  const { pool, loading } = useJourneyQuestionPool(journeyId);
  const today = challengeDate();
  return { daily: pickForDate(pool, today), loading, date: today };
}
