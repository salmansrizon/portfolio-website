import { describe, it, expect, vi, afterEach } from 'vitest';
import { levelFor, streakFrom, LEVELS } from './levels';

describe('levelFor', () => {
  it('starts at level 1 with no XP', () => {
    expect(levelFor(0).level).toBe(1);
  });

  it('lands exactly on a threshold', () => {
    expect(levelFor(3800).level).toBe(10);
    expect(levelFor(3800).name).toBe('Analyst');
  });

  it('stays on the lower level one XP short', () => {
    expect(levelFor(3799).level).toBe(9);
    expect(levelFor(3799).name).toBeUndefined();
  });

  it('caps at the top level and reports no next', () => {
    const top = levelFor(999_999);
    expect(top.level).toBe(LEVELS[LEVELS.length - 1].level);
    expect(top.next).toBeNull();
    expect(top.progress).toBe(1);
  });

  it('reports progress through the current level', () => {
    // Level 2 spans 50..150, so 100 XP is halfway.
    expect(levelFor(100).level).toBe(2);
    expect(levelFor(100).progress).toBeCloseTo(0.5);
  });
});

describe('streakFrom', () => {
  const TZ = 'Asia/Dhaka';
  // Fixed "now" so the test does not drift with the wall clock.
  const now = new Date('2026-08-17T06:00:00Z');

  afterEach(() => vi.useRealTimers());
  const freeze = () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  };

  it('is zero with no history', () => {
    freeze();
    expect(streakFrom([], TZ)).toEqual({ current: 0, longest: 0 });
  });

  it('counts consecutive days ending today', () => {
    freeze();
    const days = ['2026-08-15T10:00:00Z', '2026-08-16T10:00:00Z', '2026-08-17T05:00:00Z'];
    expect(streakFrom(days, TZ).current).toBe(3);
  });

  it('survives a gap of one day — yesterday still counts', () => {
    freeze();
    const days = ['2026-08-15T10:00:00Z', '2026-08-16T10:00:00Z'];
    expect(streakFrom(days, TZ).current).toBe(2);
  });

  it('breaks when the last solve is older than yesterday', () => {
    freeze();
    const days = ['2026-08-10T10:00:00Z', '2026-08-11T10:00:00Z'];
    const s = streakFrom(days, TZ);
    expect(s.current).toBe(0);
    // The broken run is still remembered — the anxiety valve.
    expect(s.longest).toBe(2);
  });

  it('does not double-count several solves on one day', () => {
    freeze();
    const days = ['2026-08-17T01:00:00Z', '2026-08-17T03:00:00Z', '2026-08-17T05:00:00Z'];
    expect(streakFrom(days, TZ).current).toBe(1);
  });

  it('keeps the longest run from earlier history', () => {
    freeze();
    const days = [
      '2026-07-01T10:00:00Z', '2026-07-02T10:00:00Z', '2026-07-03T10:00:00Z', '2026-07-04T10:00:00Z',
      '2026-08-17T05:00:00Z',
    ];
    const s = streakFrom(days, TZ);
    expect(s.current).toBe(1);
    expect(s.longest).toBe(4);
  });
});
