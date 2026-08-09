import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimerController } from './TimerController';

describe('useTimerController', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts inactive with no time limit when none is given', () => {
    const { result } = renderHook(() => useTimerController(undefined));

    expect(result.current.timeLeft).toBeNull();
    expect(result.current.timerActive).toBe(false);
  });

  it('initializes timeLeft and activates the timer when given a limit', () => {
    const { result } = renderHook(() => useTimerController(60));

    expect(result.current.timeLeft).toBe(60);
    expect(result.current.timerActive).toBe(true);
  });

  it('counts down once per second while active', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTimerController(3));

    expect(result.current.timeLeft).toBe(3);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.timeLeft).toBe(2);
  });

  it('stops at zero and deactivates the timer', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTimerController(1));

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.timeLeft).toBe(0);
    expect(result.current.timerActive).toBe(false);
  });

  it('recordMistake increments totalMistakes', () => {
    const { result } = renderHook(() => useTimerController(60));

    act(() => {
      result.current.recordMistake();
      result.current.recordMistake();
    });

    expect(result.current.totalMistakes).toBe(2);
  });

  it('formatTime pads minutes and seconds', () => {
    const { result } = renderHook(() => useTimerController(60));

    expect(result.current.formatTime(65)).toBe('01:05');
    expect(result.current.formatTime(5)).toBe('00:05');
  });
});
