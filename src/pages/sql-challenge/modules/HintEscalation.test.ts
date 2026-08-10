import { describe, it, expect } from 'vitest';
import { getHintEscalationState } from './HintEscalation';

describe('getHintEscalationState', () => {
  describe('question has hints', () => {
    it('awaits the first hint before any failure', () => {
      expect(getHintEscalationState(0, 3, true)).toEqual({ kind: 'awaiting-first-hint' });
    });

    it('reveals one hint per failed attempt', () => {
      expect(getHintEscalationState(1, 3, true)).toEqual({
        kind: 'hints-revealed',
        revealedCount: 1,
        totalHints: 3,
        nextHintAt: 2,
        solutionRevealed: false,
      });
    });

    it('stops revealing once every hint is unlocked', () => {
      expect(getHintEscalationState(3, 3, true)).toEqual({
        kind: 'hints-revealed',
        revealedCount: 3,
        totalHints: 3,
        nextHintAt: null,
        solutionRevealed: false,
      });
    });

    it('reveals the solution two attempts after the last hint, if one exists', () => {
      expect(getHintEscalationState(5, 3, true)).toEqual({
        kind: 'hints-revealed',
        revealedCount: 3,
        totalHints: 3,
        nextHintAt: null,
        solutionRevealed: true,
      });
    });

    it('never reveals a solution that does not exist', () => {
      expect(getHintEscalationState(10, 3, false)).toEqual({
        kind: 'hints-revealed',
        revealedCount: 3,
        totalHints: 3,
        nextHintAt: null,
        solutionRevealed: false,
      });
    });
  });

  describe('question has no hints', () => {
    it('shows nothing before the 3rd failed attempt', () => {
      expect(getHintEscalationState(0, 0, true)).toEqual({ kind: 'awaiting-first-hint' });
      expect(getHintEscalationState(2, 0, true)).toEqual({ kind: 'awaiting-first-hint' });
    });

    it('counts down to the solution starting at the 3rd attempt', () => {
      expect(getHintEscalationState(3, 0, true)).toEqual({ kind: 'no-hints-waiting', attemptsRemaining: 2 });
      expect(getHintEscalationState(4, 0, true)).toEqual({ kind: 'no-hints-waiting', attemptsRemaining: 1 });
    });

    it('reveals the solution on the 5th failed attempt', () => {
      expect(getHintEscalationState(5, 0, true)).toEqual({ kind: 'no-hints-solution-revealed' });
    });

    it('keeps waiting past the 5th attempt when there is no solution to reveal', () => {
      expect(getHintEscalationState(5, 0, false)).toEqual({ kind: 'no-hints-waiting', attemptsRemaining: 0 });
    });
  });
});
