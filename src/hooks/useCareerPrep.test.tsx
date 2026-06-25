import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useQuestions } from './useCareerPrep';

// Tracer bullet test - test OBSERVABLE BEHAVIOR only
// We don't care if it uses repository, direct Supabase, or carrier pigeon
// We only care that: given a query, it returns questions

describe('useQuestions Hook - Behavioral Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  // TRACER BULLET: One test, one behavior
  it('should return an array of questions', () => {
    const { result } = renderHook(() => useQuestions(), { wrapper });
    
    // Behavior: hook must return a questions array (empty or populated)
    expect(Array.isArray(result.current.questions)).toBe(true);
  });

  // VERTICAL SLICE: Add tests one at a time
  it('should return loading as boolean', () => {
    const { result } = renderHook(() => useQuestions(), { wrapper });
    
    // Behavior: loading must be a boolean
    expect(typeof result.current.loading).toBe('boolean');
  });

  it('should return questions with required fields', () => {
    const { result } = renderHook(() => useQuestions(), { wrapper });
    
    // Behavior: if questions exist, they must have required fields
    if (result.current.questions.length > 0) {
      const question = result.current.questions[0];
      expect(question).toHaveProperty('id');
      expect(question).toHaveProperty('title');
      expect(question).toHaveProperty('slug');
    }
  });
});
