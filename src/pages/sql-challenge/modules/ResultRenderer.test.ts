import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResultRenderer } from './ResultRenderer';

describe('useResultRenderer', () => {
  it('starts with no mission results and the share dialog closed', () => {
    const { result } = renderHook(() => useResultRenderer());

    expect(result.current.missionResults).toBeNull();
    expect(result.current.showShareDialog).toBe(false);
  });

  it('recordMissionResults computes accuracy and a positive XP for a perfect run', () => {
    const { result } = renderHook(() => useResultRenderer());

    act(() => {
      result.current.recordMissionResults(4, 4, 30, 0);
    });

    expect(result.current.missionResults).toMatchObject({
      correctSteps: 4,
      totalSteps: 4,
      timeTaken: 30,
      accuracy: 100,
    });
    expect(result.current.missionResults!.xpEarned).toBeGreaterThan(0);
  });

  it('recordMissionResults reduces XP for mistakes and never goes negative', () => {
    const { result } = renderHook(() => useResultRenderer());

    act(() => {
      result.current.recordMissionResults(1, 4, 600, 50);
    });

    expect(result.current.missionResults!.accuracy).toBe(25);
    expect(result.current.missionResults!.xpEarned).toBeGreaterThanOrEqual(0);
  });
});
