// ── HintEscalation ────────────────────────────────────────────────────────────
// Internal module: which hints unlock (and when the solution reveals) as a
// function of failed-attempt count. Used by SQLChallenge.tsx's Mission-Failed
// dialog.

export type HintEscalationState =
  | { kind: 'awaiting-first-hint' }
  | { kind: 'no-hints-waiting'; attemptsRemaining: number }
  | { kind: 'no-hints-solution-revealed' }
  | {
      kind: 'hints-revealed';
      revealedCount: number;
      totalHints: number;
      nextHintAt: number | null;
      solutionRevealed: boolean;
    };

// Mirrors the escalation rules the Mission-Failed dialog renders:
// - with hints: one more hint unlocks per failed attempt; once every hint is
//   unlocked, the solution reveals two attempts later (if one exists).
// - with no hints at all: nothing shows until the 3rd failed attempt, and the
//   solution (if any) reveals on the 5th.
export function getHintEscalationState(
  fails: number,
  hintCount: number,
  hasSolution: boolean
): HintEscalationState {
  const revealedCount = Math.min(fails, hintCount);
  const nextHintAt = revealedCount < hintCount ? revealedCount + 1 : null;

  if (hintCount === 0 && fails >= 3) {
    if (fails >= 5 && hasSolution) {
      return { kind: 'no-hints-solution-revealed' };
    }
    return { kind: 'no-hints-waiting', attemptsRemaining: 5 - fails };
  }

  if (revealedCount > 0) {
    const solutionRevealed = revealedCount >= hintCount && fails >= hintCount + 2 && hasSolution;
    return { kind: 'hints-revealed', revealedCount, totalHints: hintCount, nextHintAt, solutionRevealed };
  }

  return { kind: 'awaiting-first-hint' };
}
