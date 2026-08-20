import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// The daily challenge is GLOBAL and identical for everyone, drawn from a
// pre-shuffled deck in `daily_challenges` rather than a hash of the date: a
// stateless hash-mod repeats after roughly 18 days on a pool this size, which
// makes the "daily" feel fake fast.
//
// The date is resolved in Asia/Dhaka, not the visitor's own timezone, so that
// everyone genuinely gets the same question and it stays discussable.

const CHALLENGE_TZ = 'Asia/Dhaka';

export function challengeDate(now = new Date(), timeZone = CHALLENGE_TZ): string {
  // en-CA formats as YYYY-MM-DD, which is what the date column wants.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export interface DailyChallenge {
  for_date: string;
  question: { id: string; slug: string; title: string; difficulty: string; industry: string } | null;
}

export function useDailyChallenge() {
  const today = challengeDate();

  const { data, isLoading } = useQuery({
    queryKey: ['daily-challenge', today],
    // The deck is fixed, so there is no reason to refetch during a session.
    staleTime: 60 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('daily_challenges')
        .select('for_date, question:careerprep_questions(id, slug, title, difficulty, industry)')
        .eq('for_date', today)
        .maybeSingle();
      if (error) return null;
      return (data ?? null) as DailyChallenge | null;
    },
  });

  return { daily: data ?? null, loading: isLoading };
}
