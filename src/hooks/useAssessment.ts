import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// The timed final assessment. Everything that decides an outcome happens in the
// database: the server picks the questions and grades the answers, because this
// is the one path that issues a credential someone may put on a CV.

export const ASSESSMENT_MINUTES = 60;

export interface AssessmentQuestion {
  id: string;
  title: string;
  content_md: string;
  difficulty: string;
  industry: string;
  options: { label: string; text: string }[];
}

export interface AssessmentResult {
  score: number;
  total: number;
  passed: boolean;
  certificate_id: string | null;
}

export function useStartAssessment() {
  return useMutation({
    mutationFn: async (journeyId: string) => {
      const { data, error } = await (supabase as any).rpc('start_assessment', {
        p_journey_id: journeyId,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return { attemptId: row.attempt_id as string, questionIds: row.question_ids as string[] };
    },
  });
}

/**
 * Fetches the paper through `assessment_paper()`.
 *
 * The exam questions live in a pool that is invisible to every client — a
 * row-level policy hides `is_assessment_only` rows — so they cannot be read from
 * the table at all, answers included. The function returns the question text and
 * options and deliberately never `correct_option`, and it only answers for an
 * attempt belonging to the caller.
 */
export function useAssessmentQuestions(attemptId: string | null) {
  const { data = [], isLoading } = useQuery({
    queryKey: ['assessment-paper', attemptId],
    enabled: !!attemptId,
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('assessment_paper', {
        p_attempt_id: attemptId,
      });
      if (error) throw error;

      return ((data ?? []) as any[])
        .map((q: any) => ({
          ...q,
          options: Array.isArray(q.options)
            ? q.options.map((o: any, i: number) =>
                typeof o === 'string'
                  ? { label: String.fromCharCode(65 + i), text: o }
                  : { label: o.label ?? String.fromCharCode(65 + i), text: o.text ?? '' },
              )
            : [],
        })) as AssessmentQuestion[];
    },
  });
  return { questions: data, loading: isLoading };
}

export function useSubmitAssessment() {
  return useMutation({
    mutationFn: async ({
      attemptId,
      answers,
    }: {
      attemptId: string;
      answers: Record<string, string>;
    }) => {
      const { data, error } = await (supabase as any).rpc('submit_assessment', {
        p_attempt_id: attemptId,
        p_answers: answers,
      });
      if (error) throw error;
      return (Array.isArray(data) ? data[0] : data) as AssessmentResult;
    },
  });
}

export function useCertificate(id?: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['certificate', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('certificates')
        .select('id, credential_title, holder_name, assessed_summary, status, issued_at, revoked_at')
        .eq('id', id)
        .maybeSingle();
      if (error) return null;
      return data ?? null;
    },
  });
  return { certificate: data ?? null, loading: isLoading };
}
