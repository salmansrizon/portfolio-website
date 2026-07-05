// Grading seam: the single place that turns a Candidate's result set into a Verdict.
// Preserves the lenient semantics that shipped in SQLChallenge.tsx exactly —
// order-insensitive, column-name-agnostic, values-only comparison. Tightening
// ORDER BY sensitivity is a deliberate later change (see follow-up ADR), not this seam.

export interface Verdict {
  correct: boolean;
}

function normalize(rows: Record<string, unknown>[]): string {
  return JSON.stringify(rows.map((r) => JSON.stringify(Object.values(r))).sort());
}

export function gradeSubmission(
  userRows: Record<string, unknown>[],
  solutionRows: Record<string, unknown>[],
): Verdict {
  return { correct: normalize(userRows) === normalize(solutionRows) };
}
