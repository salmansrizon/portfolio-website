import * as React from 'react';
const { useState, useEffect, useCallback } = React;
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { createRepository } from '@/integrations/supabase/repository';
import { careerPrepQuestionConfig } from '@/adapters/entityConfigs';

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

export function useQuestion(slug?: string) {
  const [question, setQuestion] = useState<CareerPrepQuestion | null>(null);
  const [children, setChildren] = useState<CareerPrepQuestion[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetchQuestionData = async () => {
      setLoading(true);
      const table = (supabase as any).from('careerprep_questions');
      
      // 1. Fetch ALL questions related to missions (to be safe and consistent with Admin panel)
      const { data: allQuestions, error: allErr } = await table.select('*');
      
      if (allErr || !allQuestions) {
        setLoading(false);
        return;
      }

      // 2. Find the target question by slug
      const target = allQuestions.find((q: any) => q.slug === slug);
      
      if (!target) {
        setQuestion(null);
        setLoading(false);
        return;
      }

      setQuestion(target);

      // 3. Filter children locally by parent_id match
      const kids = allQuestions.filter((q: any) => q.parent_id === target.id);
      setChildren(kids);

      setLoading(false);
    };

    fetchQuestionData();
  }, [slug]);

  return { question, children, loading };
}

export function useSubmissions(questionId?: string) {
  const { session } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    if (!questionId || !session?.user) return;
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('careerprep_submissions')
      .select('*')
      .eq('question_id', questionId)
      // .eq('student_id', session.user.id) // Enable this if student_id is correctly mapped
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
    const guestEmail = localStorage.getItem('careerprep_guest_email');
    const sessionId = localStorage.getItem('careerprep_session_id');
    
    // Create base query
    let query = (supabase as any).from('careerprep_submissions').select('question_id').eq('is_correct', true);
    
    if (session?.user) {
      query = query.eq('student_id', session.user.id);
    } else if (guestEmail) {
      query = query.eq('guest_email', guestEmail);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId);
    } else {
      setLoading(false);
      return;
    }

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

export function useXPStats() {
  const [stats, setStats] = useState({ xp: 0, streak: 0 });
  const { session } = useAuth();
  const { completedIds } = useCompletedMissions();

  useEffect(() => {
     // For now, calculate XP simply based on completed unique missions
     // Each mission = 10 XP
     const xp = completedIds.size * 10;
     
     // Simple streak mock logic based on last active
     // (In a real app, this would be computed server-side or from a history table)
     const guestEmail = localStorage.getItem('careerprep_guest_email');
     const guestActive = localStorage.getItem('careerprep_guest_last_active');
     let streak = session ? 3 : 0; // Default/Mock
     
     if (!session && guestEmail && guestActive) {
        const last = new Date(guestActive);
        const diff = (new Date().getTime() - last.getTime()) / (1000 * 3600 * 24);
        if (diff < 2) streak = 1; // Basic survival streak
     }

     setStats({ xp, streak });
  }, [completedIds, session]);

  return stats;
}
