// ── SubmissionValidator ──────────────────────────────────────────────────────
// Internal module: decides whether a submission is correct.
// Used by SQLChallenge.tsx's handleSubmit.

export interface QueryablePGlite {
  query(sql: string): Promise<{ rows: any[] }>;
}

export interface SubmissionQuestion {
  question_type?: string;
  correct_option?: string | null;
  solution_sql?: string | null;
}

// Rows are compared as sets, not sequences: each row is stringified from its
// values (column names ignored) and the resulting list is sorted, so the
// submission is judged on the data it returns, not the order it arrives in.
export function normalizeRows(rows: any[]): string {
  return JSON.stringify(rows.map(r => JSON.stringify(Object.values(r))).sort());
}

export async function validateSubmission(
  pg: QueryablePGlite | null,
  code: string,
  currentQ: SubmissionQuestion | null | undefined,
  mcqAnswer: string | null
): Promise<boolean> {
  if (!currentQ) return false;

  if (currentQ.question_type === 'mcq') {
    return mcqAnswer === currentQ.correct_option;
  }

  if (!pg || !currentQ.solution_sql) return false;

  try {
    const userRes = await pg.query(code);
    const solRes = await pg.query(currentQ.solution_sql);
    return normalizeRows(userRes.rows) === normalizeRows(solRes.rows);
  } catch {
    return false;
  }
}
