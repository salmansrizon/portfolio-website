import * as React from 'react';
const { useState, useEffect, useCallback } = React;
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { createRepository } from '@/integrations/supabase/repository';
import { careerPrepQuestionConfig } from '@/adapters/entityConfigs';
import { levelFor, streakFrom } from '@/lib/levels';

// Create repository instance for career prep questions
const questionRepository = createRepository(careerPrepQuestionConfig);

export type QuestionType = 'root' | 'code' | 'mcq' | 'case_study';

export interface MCQOption {
  label: string; // "A" | "B" | "C" | "D"
  text: string;
}

export interface CareerPrepQuestion {
  id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  industry: string;
  content_md: string;
  schema_sql: string;
  initial_sql: string;
  solution_sql: string;
  success_rate: number;
  hints?: string[];
  // New hierarchical / categorisation fields
  question_type: QuestionType;
  parent_id?: string | null;
  category?: string;
  tags?: string[];
  time_limit_secs?: number | null;
  order_index?: number;
  weight?: number;          // Added for weighted scoring
  options?: MCQOption[];        // MCQ only
  correct_option?: string;      // MCQ only — "A"|"B"|"C"|"D"
}

export function useQuestions() {
  const { data: questions = [], isLoading: loading, error } = questionRepository.useFindAll();

  useEffect(() => {
    if (error) {
      console.error('Error fetching questions. Has the table been created in Supabase Dashboard?', error);
    }
  }, [error]);

  return { questions, loading };
}

// A stable empty-array reference — useMissionRunner's effect is keyed on
// `children` by reference, so a fresh `[]` default on every render (while the
// children query is disabled/pending) would re-fire it forever.
const NO_CHILDREN: CareerPrepQuestion[] = [];

export function useQuestion(slug?: string) {
  // useFindAll has no `enabled` gate, so an empty slug still issues a query
  // (matching nothing) rather than skipping — harmless today since the only
  // caller always passes a defined string, but worth knowing if that changes.
  const { data: matches, isLoading: loadingQuestion } = questionRepository.useFindAll({ slug: slug || '' });
  const question = matches?.[0] || null;

  const { data: children = NO_CHILDREN, isLoading: loadingChildren } = useQuery({
    queryKey: ['careerprep_questions', 'children', question?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careerprep_questions' as any)
        .select('*')
        .eq('parent_id', question!.id);
      if (error) throw error;
      return (data || []) as unknown as CareerPrepQuestion[];
    },
    enabled: !!question?.id,
  });

  return { question, children, loading: loadingQuestion || loadingChildren };
}

export function useSubmissions(questionId?: string) {
  const { session } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    if (!questionId || !session?.user) return;
    setLoading(true);
    // Scoped to the signed-in learner, and to the columns the history panel
    // renders. Without the student_id filter this returns *everyone's* raw SQL
    // for the question — harmless while only correct rows existed, a leak of
    // both solutions and other people's failed attempts now that every
    // submission is stored.
    const { data, error } = await (supabase as any)
      .from('careerprep_submissions')
      .select('id, submitted_code, is_correct, created_at')
      .eq('question_id', questionId)
      .eq('student_id', session.user.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setSubmissions(data || []);
    }
    setLoading(false);
  }, [questionId, session]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return { submissions, loading, refresh: fetchSubmissions };
}

export function useSubmitCode() {
  const { session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const logSubmission = useCallback(async (
    questionId: string, 
    submittedCode: string, 
    isCorrect: boolean, 
    executionTimeMs: number
  ) => {
    setIsSubmitting(true);
    
    // Get guest info from localStorage if present
    const guestEmail = localStorage.getItem('careerprep_guest_email');
    const guestWhatsapp = localStorage.getItem('careerprep_guest_whatsapp');
    const sessionId = localStorage.getItem('careerprep_session_id');
    
    // Update local last active for guest streak logic
    localStorage.setItem('careerprep_guest_last_active', new Date().toISOString());

    try {
      const { error } = await (supabase as any)
        .from('careerprep_submissions')
        .insert({
          question_id: questionId,
          submitted_code: submittedCode,
          is_correct: isCorrect,
          execution_time: executionTimeMs,
          student_id: session?.user?.id || null,
          guest_email: guestEmail,
          guest_whatsapp: guestWhatsapp,
          session_id: sessionId
        });
      
      if (error) {
        console.error("Submission log error:", error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }, [session]);

  return { logSubmission, isSubmitting };
}

export function useCompletedMissions() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();
  
  const fetchCompleted = useCallback(async () => {
    // Everyone has an auth.uid() now, guests included — they are signed in
    // anonymously on first visit. So progress is always keyed on student_id,
    // and the old guest_email / careerprep_session_id branches are gone: those
    // could only ever work while the table was world-readable.
    if (!session?.user) {
      setLoading(false);
      return;
    }

    const query = (supabase as any)
      .from('careerprep_submissions')
      .select('question_id')
      .eq('is_correct', true)
      .eq('student_id', session.user.id);

    setLoading(true);
    const { data, error } = await query;
    if (!error) {
       const ids = new Set<string>((data || []).map((d: any) => d.question_id as string));
       setCompletedIds(ids);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetchCompleted();
  }, [fetchCompleted]);

  return { completedIds, loading, refresh: fetchCompleted };
}

/**
 * Real XP, level and streak — previously both numbers were invented in the
 * browser (`completedIds.size * 10`, and a hardcoded `streak = 3`).
 *
 * XP is summed from the `xp_events` ledger, which only the database writes (a
 * trigger on `careerprep_submissions`), so it cannot be inflated from the
 * client. Streak is derived from the dates of correct submissions in the
 * learner's timezone. Level is derived from XP; it is never stored.
 */
export function useXPStats() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['careerprep', 'progress', userId],
    enabled: !!userId,
    queryFn: async () => {
      const [xpRes, subRes] = await Promise.all([
        (supabase as any).from('xp_events').select('amount').eq('user_id', userId),
        (supabase as any)
          .from('careerprep_submissions')
          .select('created_at')
          .eq('student_id', userId)
          .eq('is_correct', true),
      ]);

      const xp = (xpRes.data ?? []).reduce((sum: number, r: any) => sum + (r.amount ?? 0), 0);
      const dates = (subRes.data ?? []).map((r: any) => r.created_at).filter(Boolean);
      return { xp, dates: dates as string[] };
    },
  });

  const xp = data?.xp ?? 0;
  const { current, longest } = streakFrom(data?.dates ?? []);
  const standing = levelFor(xp);

  return {
    xp,
    streak: current,
    longestStreak: longest,
    level: standing.level,
    levelName: standing.name,
    nextLevelXp: standing.next,
    levelProgress: standing.progress,
    loading: isLoading,
  };
}
