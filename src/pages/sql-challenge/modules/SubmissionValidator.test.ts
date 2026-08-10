import { describe, it, expect } from 'vitest';
import { validateSubmission, normalizeRows, QueryablePGlite } from './SubmissionValidator';

function fakePg(responses: Record<string, any[]>): QueryablePGlite {
  return {
    query: async (sql: string) => ({ rows: responses[sql] ?? [] }),
  };
}

describe('SubmissionValidator', () => {
  it('returns false when there is no current question', async () => {
    const result = await validateSubmission(null, 'SELECT 1;', null, null);
    expect(result).toBe(false);
  });

  describe('MCQ questions', () => {
    it('is correct when the chosen answer matches correct_option', async () => {
      const result = await validateSubmission(null, '', { question_type: 'mcq', correct_option: 'B' }, 'B');
      expect(result).toBe(true);
    });

    it('is incorrect when the chosen answer does not match', async () => {
      const result = await validateSubmission(null, '', { question_type: 'mcq', correct_option: 'B' }, 'A');
      expect(result).toBe(false);
    });

    it('is incorrect when nothing is chosen yet', async () => {
      const result = await validateSubmission(null, '', { question_type: 'mcq', correct_option: 'B' }, null);
      expect(result).toBe(false);
    });
  });

  describe('SQL questions', () => {
    const currentQ = { question_type: 'code', solution_sql: 'SELECT * FROM t;' };

    it('is correct when user rows match solution rows regardless of order', async () => {
      const pg = fakePg({
        'SELECT * FROM t ORDER BY id DESC;': [{ id: 2 }, { id: 1 }],
        'SELECT * FROM t;': [{ id: 1 }, { id: 2 }],
      });
      const result = await validateSubmission(pg, 'SELECT * FROM t ORDER BY id DESC;', currentQ, null);
      expect(result).toBe(true);
    });

    it('is incorrect when rows differ', async () => {
      const pg = fakePg({
        'SELECT * FROM t WHERE id = 1;': [{ id: 1 }],
        'SELECT * FROM t;': [{ id: 1 }, { id: 2 }],
      });
      const result = await validateSubmission(pg, 'SELECT * FROM t WHERE id = 1;', currentQ, null);
      expect(result).toBe(false);
    });

    it('is incorrect when the user query throws', async () => {
      const pg: QueryablePGlite = {
        query: async (sql: string) => {
          if (sql === 'BAD SQL') throw new Error('syntax error');
          return { rows: [] };
        },
      };
      const result = await validateSubmission(pg, 'BAD SQL', currentQ, null);
      expect(result).toBe(false);
    });

    it('is incorrect when there is no PGlite instance', async () => {
      const result = await validateSubmission(null, 'SELECT 1;', currentQ, null);
      expect(result).toBe(false);
    });

    it('is incorrect when the question has no solution_sql', async () => {
      const pg = fakePg({});
      const result = await validateSubmission(pg, 'SELECT 1;', { question_type: 'code', solution_sql: null }, null);
      expect(result).toBe(false);
    });
  });

  describe('normalizeRows', () => {
    it('ignores column names and row order', () => {
      const a = normalizeRows([{ id: 1, name: 'a' }, { id: 2, name: 'b' }]);
      const b = normalizeRows([{ x: 2, y: 'b' }, { x: 1, y: 'a' }]);
      expect(a).toBe(b);
    });

    it('distinguishes different values', () => {
      const a = normalizeRows([{ id: 1 }]);
      const b = normalizeRows([{ id: 2 }]);
      expect(a).not.toBe(b);
    });
  });
});
