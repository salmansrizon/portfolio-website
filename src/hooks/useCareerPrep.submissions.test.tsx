import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Guards two Phase 0 fixes on careerprep_submissions.
//
// 1. Every attempt must be stored. SQLChallenge used to call logSubmission
//    *inside* the `if (isCorrect)` branch with is_correct hardcoded `true`, so
//    failures were never recorded. Streak, XP, success rate and the struggle
//    trigger all derive from this table.
//
//    Caveat, stated plainly: this asserts the hook writes whatever verdict it
//    is handed. The hook was never the broken part — re-nesting the call site
//    inside `if (isCorrect)` would still pass this. The call site lives in a
//    Monaco/PGLite component that cannot be rendered cheaply, so that half is
//    guarded by review, not by this test.
//
// 2. Submission history must be scoped to its owner. The owner filter was
//    commented out, which was survivable while only correct rows existed and
//    became a leak of other learners' raw SQL once failures started landing.
//    This one *does* guard the real regression.

const insert = vi.fn().mockResolvedValue({ error: null });
const eq = vi.fn();
const order = vi.fn().mockResolvedValue({ data: [], error: null });
const select = vi.fn();

// Chainable query builder that records every .eq() it is given.
const builder = { select, eq, order };
select.mockReturnValue(builder);
eq.mockReturnValue(builder);

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: () => ({ insert, select, eq, order }) },
}));

const session = { user: { id: 'user-42' } };
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ session: { user: { id: 'user-42' } } }),
}));

import { useSubmitCode, useSubmissions } from './useCareerPrep';

describe('careerprep_submissions', () => {
  beforeEach(() => {
    insert.mockClear();
    eq.mockClear();
    select.mockClear();
  });

  it.each([true, false])('logSubmission persists is_correct: %s', async (verdict) => {
    const { result } = renderHook(() => useSubmitCode());

    await act(async () => {
      await result.current.logSubmission('question-1', 'select 1;', verdict, 12);
    });

    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert.mock.calls[0][0]).toMatchObject({
      question_id: 'question-1',
      submitted_code: 'select 1;',
      is_correct: verdict,
    });
  });

  it('useSubmissions scopes history to the signed-in learner', async () => {
    renderHook(() => useSubmissions('question-1'));

    await waitFor(() => expect(eq).toHaveBeenCalled());

    const filters = Object.fromEntries(eq.mock.calls as [string, unknown][]);
    expect(filters).toMatchObject({
      question_id: 'question-1',
      student_id: session.user.id,
    });
  });

  it('useSubmissions selects only the columns the history panel renders', async () => {
    renderHook(() => useSubmissions('question-1'));

    await waitFor(() => expect(select).toHaveBeenCalled());

    // `select('*')` on this table would ship guest_email and guest_whatsapp too.
    expect(select).not.toHaveBeenCalledWith('*');
  });
});
