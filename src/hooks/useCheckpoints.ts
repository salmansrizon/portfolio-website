import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// A Checkpoint is the one MCQ Question that closes a Topic. Passing it is what
// "completing a Topic" means; failing is a SOFT gate, so the learner may carry
// on and only the certificate requires every Checkpoint passed.
//
// It used to hang off a Roadmap Step. It no longer does — see
// docs/adr/0004-career-prep-does-not-render-roadmaps.md.

export interface MCQOption {
  label: string;
  text: string;
}

export interface Checkpoint {
  id: string;
  title: string;
  content_md: string;
  options: MCQOption[];
}

/** The full Checkpoint Question — text and options, never the answer. */
export function useCheckpoint(questionId?: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['checkpoint', questionId],
    enabled: !!questionId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('careerprep_questions')
        .select('id, title, content_md, options')
        .eq('id', questionId)
        .maybeSingle();
      if (error || !data) return null;

      // Options are jsonb and have been written in a few shapes over time;
      // normalise rather than trusting one.
      const options: MCQOption[] = Array.isArray(data.options)
        ? data.options.map((o: any, i: number) =>
            typeof o === 'string'
              ? { label: String.fromCharCode(65 + i), text: o }
              : { label: o.label ?? String.fromCharCode(65 + i), text: o.text ?? '' },
          )
        : [];
      return { ...data, options } as Checkpoint;
    },
  });

  return { checkpoint: data ?? null, loading: isLoading };
}

/**
 * Records a Checkpoint attempt and, on a pass, marks the Topic complete.
 *
 * Grading runs in the database (`grade_topic_checkpoint`), which also refuses a
 * question that is not this Topic's Checkpoint — otherwise any question id could
 * be submitted against any Topic to complete it. The correct answer comes back
 * only *after* the attempt is recorded, so the client never needs the key in
 * hand to render the explanation.
 *
 * Caveat worth knowing: `correct_option` is still readable directly from
 * `careerprep_questions`, because that table has a blanket public-read policy
 * and RLS is row-level, not column-level. Grading server-side removes the
 * *dependency* on the key; it does not yet hide it.
 */
export function useSubmitCheckpoint(topicId?: string) {
  const { session } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      checkpoint,
      choice,
      firstTry,
    }: {
      checkpoint: Checkpoint;
      choice: string;
      firstTry: boolean;
    }) => {
      if (!session?.user?.id || !topicId) throw new Error('Not signed in');

      const { data, error } = await (supabase as any).rpc('grade_topic_checkpoint', {
        p_question_id: checkpoint.id,
        p_topic_id: topicId,
        p_choice: choice,
        p_first_try: firstTry,
      });
      if (error) throw error;

      const row = Array.isArray(data) ? data[0] : data;
      return {
        isCorrect: !!row?.is_correct,
        correctOption: (row?.correct_option as string) ?? null,
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['topic-progress'] });
    },
  });
}
