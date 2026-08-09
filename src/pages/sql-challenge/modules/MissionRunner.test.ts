import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMissionRunner } from './MissionRunner';

describe('useMissionRunner', () => {
  const rootQuestion = { id: 'root', question_type: 'root' };
  const children = [
    { id: 'c2', order_index: 2 },
    { id: 'c1', order_index: 1 },
  ];
  const singleQuestion = { id: 'single', question_type: 'code' };
  // A stable empty-array reference — useMissionRunner's effect is keyed on
  // `children` by reference, so passing a fresh `[]` literal inline on every
  // render of the renderHook wrapper causes it to re-fire forever.
  const noChildren: any[] = [];

  it('builds the mission queue from sorted children for a root question', () => {
    const { result } = renderHook(() => useMissionRunner(rootQuestion, children));

    expect(result.current.missionQueue.map((q: any) => q.id)).toEqual(['c1', 'c2']);
    expect(result.current.currentQuestion?.id).toBe('c1');
    expect(result.current.cursorIdx).toBe(0);
    expect(result.current.isMissionComplete).toBe(false);
  });

  it('falls back to [question] when a root question has no children', () => {
    const { result } = renderHook(() => useMissionRunner(rootQuestion, noChildren));

    expect(result.current.missionQueue).toEqual([rootQuestion]);
  });

  it('treats a non-root question as a single-step mission', () => {
    const { result } = renderHook(() => useMissionRunner(singleQuestion, noChildren));

    expect(result.current.missionQueue).toEqual([singleQuestion]);
    expect(result.current.currentQuestion).toEqual(singleQuestion);
  });

  it('advanceMission moves the cursor forward and returns false while steps remain', () => {
    const { result } = renderHook(() => useMissionRunner(rootQuestion, children));

    let didComplete: boolean | undefined;
    act(() => {
      didComplete = result.current.advanceMission();
    });

    expect(didComplete).toBe(false);
    expect(result.current.cursorIdx).toBe(1);
    expect(result.current.currentQuestion?.id).toBe('c2');
    expect(result.current.isMissionComplete).toBe(false);
  });

  it('advanceMission marks the mission complete on the last step and returns true', () => {
    const { result } = renderHook(() => useMissionRunner(rootQuestion, children));

    act(() => {
      result.current.advanceMission(); // -> cursor 1 (last step)
    });
    let didComplete: boolean | undefined;
    act(() => {
      didComplete = result.current.advanceMission(); // -> complete
    });

    expect(didComplete).toBe(true);
    expect(result.current.isMissionComplete).toBe(true);
  });

  it('resetMission returns to the first step and clears completion', () => {
    const { result } = renderHook(() => useMissionRunner(rootQuestion, children));

    act(() => {
      result.current.advanceMission();
    });
    act(() => {
      result.current.advanceMission();
    });
    expect(result.current.isMissionComplete).toBe(true);

    act(() => {
      result.current.resetMission();
    });

    expect(result.current.cursorIdx).toBe(0);
    expect(result.current.isMissionComplete).toBe(false);
  });
});
