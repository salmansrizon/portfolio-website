import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * The next-up queue — weakest-first, capped at 3.
 *
 * Ranking runs in the database because it reads two things the client cannot:
 * `checkpoint_results` and failed submissions, both owner-scoped.
 *
 * Order:
 *   1. Checkpoints failed and still not passed — a known gap outranks new
 *      material, since building on top of one is how learners quietly fall out.
 *   2. Unsolved questions in industries the learner has actually failed in.
 *   3. Anything else unsolved.
 *
 * Three items, not ten: three reads as a decision, ten reads as a backlog.
 */

export interface NextUpItem {
  rank: number;
  kind: 'retry' | 'question';
  title: string;
  slug: string;
  roadmap_slug: string | null;
  step_slug: string | null;
  difficulty: string;
  industry: string;
}

/**
 * `journeySlugs` scopes the queue to the learner's plan. The ranking still runs
 * in the database — it reads owner-scoped tables the client cannot — but the
 * result is filtered to the Journey, and topped up from the plan's own pool if
 * the ranked items fall outside it. Without that top-up an enrolled learner
 * could see an empty queue purely because their weakest areas sit in someone
 * else's syllabus.
 */
export function useNextUp(limit = 3, journeySlugs?: Set<string>) {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const scoped = journeySlugs && journeySlugs.size > 0;

  const { data = [], isLoading } = useQuery({
    queryKey: ['next-up', userId, limit, scoped ? [...journeySlugs!].sort().join(',') : 'all'],
    enabled: !!userId,
    queryFn: async () => {
      // Ask for more than we need when scoping, since some will be filtered out.
      const { data, error } = await (supabase as any).rpc('next_up', { p_limit: scoped ? limit * 6 : limit });
      if (error) return [] as NextUpItem[];
      const items = (data ?? []) as NextUpItem[];
      if (!scoped) return items.slice(0, limit);
      return items.filter((i) => journeySlugs!.has(i.slug)).slice(0, limit);
    },
  });

  return { items: data, loading: isLoading };
}
